// src/sha1.js
function utf8ToBytes(string, units) {
	units = units || Infinity;
	var codePoint;
	var length = string.length;
	var leadSurrogate = null;
	var bytes = [];
	for (var i = 0; i < length; ++i) {
		codePoint = string.charCodeAt(i);
		if (codePoint > 55295 && codePoint < 57344) {
			if (!leadSurrogate) {
				if (codePoint > 56319) {
					if ((units -= 3) > -1) bytes.push(239, 191, 189);
					continue;
				} else if (i + 1 === length) {
					if ((units -= 3) > -1) bytes.push(239, 191, 189);
					continue;
				}
				leadSurrogate = codePoint;
				continue;
			}
			if (codePoint < 56320) {
				if ((units -= 3) > -1) bytes.push(239, 191, 189);
				leadSurrogate = codePoint;
				continue;
			}
			codePoint =
				(((leadSurrogate - 55296) << 10) | (codePoint - 56320)) + 65536;
		} else if (leadSurrogate) {
			if ((units -= 3) > -1) bytes.push(239, 191, 189);
		}
		leadSurrogate = null;
		if (codePoint < 128) {
			if ((units -= 1) < 0) break;
			bytes.push(codePoint);
		} else if (codePoint < 2048) {
			if ((units -= 2) < 0) break;
			bytes.push((codePoint >> 6) | 192, (codePoint & 63) | 128);
		} else if (codePoint < 65536) {
			if ((units -= 3) < 0) break;
			bytes.push(
				(codePoint >> 12) | 224,
				((codePoint >> 6) & 63) | 128,
				(codePoint & 63) | 128
			);
		} else if (codePoint < 1114112) {
			if ((units -= 4) < 0) break;
			bytes.push(
				(codePoint >> 18) | 240,
				((codePoint >> 12) & 63) | 128,
				((codePoint >> 6) & 63) | 128,
				(codePoint & 63) | 128
			);
		} else {
			throw new Error("Invalid code point");
		}
	}
	return bytes;
}
function base64(buffer) {
	var lookup =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(
			""
		);
	function tripletToBase64(num) {
		return (
			lookup[(num >> 18) & 63] +
			lookup[(num >> 12) & 63] +
			lookup[(num >> 6) & 63] +
			lookup[num & 63]
		);
	}
	function encodeChunk(uint8, start, end) {
		var tmp;
		var output = [];
		for (var i = start; i < end; i += 3) {
			tmp =
				((uint8[i] << 16) & 16711680) +
				((uint8[i + 1] << 8) & 65280) +
				(uint8[i + 2] & 255);
			output.push(tripletToBase64(tmp));
		}
		return output.join("");
	}
	function fromByteArray(uint8) {
		var tmp;
		var len = uint8.length;
		var extraBytes = len % 3;
		var parts = [];
		var maxChunkLength = 16383;
		for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
			parts.push(
				encodeChunk(
					uint8,
					i,
					i + maxChunkLength > len2 ? len2 : i + maxChunkLength
				)
			);
		}
		if (extraBytes === 1) {
			tmp = uint8[len - 1];
			parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 63] + "==");
		} else if (extraBytes === 2) {
			tmp = (uint8[len - 2] << 8) + uint8[len - 1];
			parts.push(
				lookup[tmp >> 10] +
					lookup[(tmp >> 4) & 63] +
					lookup[(tmp << 2) & 63] +
					"="
			);
		}
		return parts.join("");
	}
	return fromByteArray(buffer).trim();
}
function allocUint8Array(sizeOrString, fill) {
	if (typeof sizeOrString == "string") {
		var stringLength = utf8ToBytes(sizeOrString).length | 0;
		var unit8 = new Uint8Array(stringLength);
		var length = unit8.length;
		var offset = 0;
		var remaining = unit8.length - offset;
		if (length > remaining) length = remaining;
		const bytes = utf8ToBytes(sizeOrString, unit8.length - offset);
		for (var i = 0; i < length; ++i) {
			if (i + offset >= unit8.length || i >= bytes.length) break;
			unit8[i + offset] = bytes[i];
		}
		return unit8;
	}
	var unit8 = new Uint8Array(sizeOrString);
	if (sizeOrString > 0 && fill !== void 0) {
		fill = (fill & 255) | 0;
		for (var i = 0; i < unit8.length; ++i) {
			unit8[i] = fill;
		}
	}
	return unit8;
}
function concatUint8Arrays(unit8s, length) {
	var unit8 = new Uint8Array(length < 0 ? 0 : length | 0);
	var offset = 0;
	for (var i = 0; i < unit8s.length; ++i) {
		var item = unit8s[i];
		if (unit8.length === 0 || item.length === 0) continue;
		if (offset >= unit8.length) offset = unit8.length;
		var end = item.length;
		if (unit8.length - offset < end) end = unit8.length - offset;
		unit8.set(item.subarray(0, end), offset);
		offset += item.length;
	}
	return unit8;
}
function sha1(key, data) {
	key = allocUint8Array(key);
	data = allocUint8Array(data);
	const blocksize = 64;
	var zeroBuffer = allocUint8Array(blocksize, 0);
	function core_sha1(x, len) {
		x[len >> 5] |= 128 << (24 - (len % 32));
		x[(((len + 64) >> 9) << 4) + 15] = len;
		var w = Array(80);
		var a = 1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d = 271733878;
		var e = -1009589776;
		for (var i2 = 0; i2 < x.length; i2 += 16) {
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;
			var olde = e;
			for (var j = 0; j < 80; j++) {
				if (j < 16) w[j] = x[i2 + j];
				else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
				var t = safe_add(
					safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
					safe_add(safe_add(e, w[j]), sha1_kt(j))
				);
				e = d;
				d = c;
				c = rol(b, 30);
				b = a;
				a = t;
			}
			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
			e = safe_add(e, olde);
		}
		return Array(a, b, c, d, e);
	}
	function sha1_ft(t, b, c, d) {
		if (t < 20) return (b & c) | (~b & d);
		if (t < 40) return b ^ c ^ d;
		if (t < 60) return (b & c) | (b & d) | (c & d);
		return b ^ c ^ d;
	}
	function sha1_kt(t) {
		return t < 20
			? 1518500249
			: t < 40
			? 1859775393
			: t < 60
			? -1894007588
			: -899497514;
	}
	function safe_add(x, y) {
		var lsw = (x & 65535) + (y & 65535);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 65535);
	}
	function rol(num, cnt) {
		return (num << cnt) | (num >>> (32 - cnt));
	}
	function sha12(buf) {
		var hashSize = 20;
		var intSize = 4;
		var chrsz = 8;
		function toArray(buf2) {
			if (buf2.length % intSize !== 0) {
				const length = buf2.length + (intSize - (buf2.length % intSize));
				buf2 = concatUint8Arrays([buf2, allocUint8Array(intSize, 0)], length);
			}
			var arr2 = [];
			for (var offset2 = 0; offset2 < buf2.length; offset2 += intSize) {
				const item =
					(buf2[offset2] << 24) |
					(buf2[offset2 + 1] << 16) |
					(buf2[offset2 + 2] << 8) |
					buf2[offset2 + 3];
				arr2.push(item);
			}
			return arr2;
		}
		var arr = core_sha1(toArray(buf), buf.length * chrsz);
		var next = allocUint8Array(hashSize);
		for (var index = 0; index < arr.length; index++) {
			var value = arr[index];
			var offset = index * 4;
			offset = offset | 0;
			if (value < 0) value = 4294967295 + value + 1;
			next[offset] = value >>> 24;
			next[offset + 1] = value >>> 16;
			next[offset + 2] = value >>> 8;
			next[offset + 3] = value & 255;
		}
		return next;
	}
	data = concatUint8Arrays([data], data.length);
	if (key.length > blocksize) {
		key = sha12(key);
	} else if (key.length < blocksize) {
		key = concatUint8Arrays([key, zeroBuffer], blocksize);
	}
	var ipad = allocUint8Array(blocksize),
		opad = allocUint8Array(blocksize);
	for (var i = 0; i < blocksize; i++) {
		ipad[i] = key[i] ^ 54;
		opad[i] = key[i] ^ 92;
	}
	const size1 = ipad.length + data.length;
	const hash = sha12(concatUint8Arrays([ipad, data], size1));
	const size2 = ipad.length + hash.length;
	const result = sha12(concatUint8Arrays([opad, hash], size2));
	return base64(result);
}

// src/index.js
function parseXML(xml) {
	if (xml instanceof XMLDocument) return xml;
	return new DOMParser().parseFromString(xml, "text/xml");
}
function getXMLContent(xml, tagName) {
	const tag = xml.querySelector(tagName);
	if (!tag) return "";
	return tag.textContent;
}
function getRequestTime(input) {
	input = new Date();
	const pad = (val) => (val > 9 ? `${val}` : `0${val}`);
	const dNames = "Sun_Mon_Tue_Wed_Thu_Fri_Sat";
	const mNames = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec";
	const month = input.getUTCMonth();
	const day = input.getUTCDay();
	const date = input.getUTCDate();
	const getMonth = () => mNames.split("_")[month];
	const getDayName = () => dNames.split("_")[day];
	const flags = {
		dd: pad(date),
		ddd: getDayName(),
		mmm: getMonth(),
		yyyy: input.getUTCFullYear(),
		HH: pad(input.getUTCHours()),
		MM: pad(input.getUTCMinutes()),
		ss: pad(input.getUTCSeconds()),
	};
	return `${flags.ddd}, ${flags.dd} ${flags.mmm} ${flags.yyyy} ${flags.HH}:${flags.MM}:${flags.ss} GMT`;
}
function request(method, options, body) {
	const _pathname = [options.bucket, options.object].filter(Boolean).join("/");
	const search = new URLSearchParams(options.subres || {});
	const resource = new URL(`oss:/${_pathname}?${search}`);
	const host = options.endpoint + "/";
	const protocol = options.secure ? "https://" : "http://";
	const pathname = encodeURIComponent(options.object)
		.replace(/%2F/g, "/")
		.replace(/\+/g, "%2B");
	let signature = "";
	{
		let getOSSHeaders = function (headers2) {
			const OSS_RE = /^(x-oss-)/i;
			return Object.entries(headers2)
				.map(([key, value]) => {
					if (!OSS_RE.test(key) || !value) return null;
					key = key.toLowerCase();
					return `${key}:${value.trim()}`;
				})
				.filter(Boolean)
				.sort()
				.join("\n");
		};
		const stringToSign = [
			method,
			"",
			options.headers["Content-Type"],
			options.headers["x-oss-date"],
			getOSSHeaders(options.headers),
			`${resource}`.replace(resource.protocol, "").replace(/\=$/, "").trim(),
		].join("\n");
		signature = sha1(options.accessKeySecret, stringToSign);
	}
	const authorization = `OSS ${options.accessKeyId}:${signature}`;
	const url = new URL(`${protocol}${host}${pathname}?${search}`);
	const headers = options.headers;
	const timeout = options.timeout;
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		function withTypeError(message) {
			let error = null;
			if (xhr.status < 200 || xhr.status >= 300) {
				var text = xhr.statusText || message;
				const status = xhr.status;
				if (xhr.responseXML) {
					const xml = parseXML(xhr.responseXML);
					const code = getXMLContent(xml, "Code");
					const message2 = getXMLContent(xml, "Message");
					const requestId = getXMLContent(xml, "RequestId");
					const hostId = getXMLContent(xml, "HostId");
					text = [
						`Status:${status}`,
						`Code:${code}`,
						`Message:${message2}`,
						`RequestId:${requestId}`,
						`HostId:${hostId}`,
					].join("\n\n");
				}
				return reject(new Error(text));
			}
			const response = {
				status: xhr.status,
				statusText: xhr.statusText,
				url: xhr.responseURL,
				ok: xhr.statusText == "OK",
				type: xhr.responseType || "default",
			};
			response.headers = {
				"x-oss-request-id": xhr.getResponseHeader("x-oss-request-id"),
				etag: JSON.parse(xhr.getResponseHeader("etag")),
			};
			response.method = method;
			response.ok = !error;
			response.data =
				xhr.responseXML || xhr.response || xhr.responseText || xhr.responseURL;
			response.bucket = options.bucket;
			response.key = resource.pathname.replace(`/${options.bucket}/`, "");
			return resolve(response);
		}
		xhr.onload = () => withTypeError();
		xhr.onerror = () => withTypeError("Request Failed");
		xhr.ontimeout = () => withTypeError("Request Timeout");
		xhr.open(method, String(url), true);
		xhr.timeout = timeout;
		for (let name in headers) {
			let value = headers[name];
			if (value && name) xhr.setRequestHeader(name.toLowerCase(), value);
		}
		xhr.setRequestHeader("authorization", authorization);
		xhr.send(body || null);
	});
}
var post = (...args) => request("POST", ...args);
var put = (...args) => request("PUT", ...args);
function getParts(file) {
	const fileSize = file.size;
	const minPartSize = 100 * 1024;
	if (!fileSize >= minPartSize) return { size: 1, slice: [] };
	const max = 10 * 1e3;
	var partSize = 1 * 1024 * 1024;
	const safeSize = Math.ceil(fileSize / max);
	if (partSize < safeSize) {
		partSize = safeSize;
		console.warn(
			`partSize has been set to ${partSize}, because the partSize you provided causes partNumber to be greater than ${max}`
		);
	}
	const size = Math.ceil(fileSize / partSize);
	const slice = [];
	for (let i = 0; i < size; i++) {
		const start = partSize * i;
		const end = Math.min(start + partSize, fileSize);
		slice.push({
			start,
			end,
		});
	}
	return { slice, size };
}
async function buildResult(upload) {
	const result = await upload();
	let url;
	let bucket = result.bucket;
	let etag = result.headers.etag;
	let key = result.key;
	if (result.data instanceof XMLDocument) {
		const xml = parseXML(result.data);
		url = getXMLContent(xml, "Location");
	} else {
		url = new URL(result.data);
		url.search = "";
	}
	return {
		url: `${url}`,
		headers: result.headers,
		bucket,
		etag,
		key,
	};
}
function tinyOSS() {
	let options = {
		region: "oss-cn-hangzhou",
		internal: false,
		secure: false,
		timeout: 6e4,
		bucket: null,
	};
	const version = "2022.04.1";
	const userAgent = `aliyun-sdk-js/${version}/` + navigator.userAgent;
	function setOptions(opts) {
		options = Object.assign(
			options,
			{
				endpoint: new URL("https://" + opts.region + ".aliyuncs.com"),
				accessKeyId: opts.accessKeyId.trim(),
				accessKeySecret: opts.accessKeySecret.trim(),
			},
			opts
		);
	}
	async function upload(osskey, file) {
		const ossdate = getRequestTime();
		const mergeOption = (contentType, subres) => ({
			...options,
			subres: subres || { uploads: "" },
			headers: {
				"Content-Type": contentType || file.type,
				"x-oss-date": ossdate,
				"x-oss-security-token": options.stsToken,
				"x-oss-user-agent": userAgent,
			},
			object: osskey.replace(/^\/+/, ""),
		});
		const { size, slice } = getParts(file);
		if (size == 1) return await buildResult(() => put(mergeOption(), file));
		const prepare = {
			uploadId: null,
			done: [],
			key: null,
		};
		{
			const result = await post(mergeOption(), null, true);
			const xml = parseXML(result.data);
			prepare.key = getXMLContent(xml, "Key");
			prepare.uploadId = getXMLContent(xml, "UploadId");
			const all = Array.from(new Array(size), (_, index) => index + 1);
			await Promise.all(
				all.map(async (partNumber) => {
					try {
						const part = slice[partNumber - 1];
						const subres = {
							partNumber,
							uploadId: prepare.uploadId,
						};
						const body = file.slice(part.start, part.end);
						const options2 = mergeOption();
						options2.subres = subres;
						const { headers } = await put(options2, body);
						prepare.done.push({
							number: partNumber,
							etag: headers.etag,
							uploadId: prepare.uploadId,
						});
					} catch (error) {
						const message = [
							`Failed to upload part${partNumber}`,
							error.message,
						];
						error.message = message.join("\n\n");
						throw error;
					}
				})
			);
		}
		{
			const completeOption = mergeOption("application/xml", {
				uploadId: prepare.uploadId,
			});
			const part = ({ number, etag }) => {
				return `<Part>
				<PartNumber>${number}</PartNumber>
				<ETag>${etag}</ETag>
			</Part>`
					.replace(/\s+/g, "")
					.trim();
			};
			const nodes = prepare.done.sort((a, b) => a.number - b.number).map(part);
			const xmltext = [
				`<?xml version="1.0" encoding="UTF-8"?>`,
				`<CompleteMultipartUpload>`,
				...nodes,
				`</CompleteMultipartUpload>`,
			].join("\n");
			return await buildResult(() => post(completeOption, xmltext, true));
		}
	}
	return { setOptions, upload };
}
export { tinyOSS as default };
