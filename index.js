//modified from https://github.com/feross/buffer
function create(input, fill) {
	//  Buffer.from
	//  Buffer.alloc
	//  Buffer.prototype.fill
	let size = typeof input == "number" && !isNaN(input) ? input : 0;
	if (size < 0) size = 0;
	let bytes = [];
	if (typeof input == "string") {
		const map = (_, index) => input.charCodeAt(index) & 0xff;
		bytes = Array.from(input, map);
		size = bytes.length;
	}
	var unit8 = new Uint8Array(size | 0);
	if (typeof fill == "undefined") {
		var length = unit8.length;
		var offset = 0;
		var remaining = unit8.length - offset;
		if (length > remaining) length = remaining;
		for (var i = 0; i < length; ++i) {
			if (i + offset >= unit8.length || i >= bytes.length) break;
			unit8[i + offset] = bytes[i];
		}
		return unit8;
	}
	if (size > 0) unit8.fill((fill & 255) | 0);
	return unit8;
}
function concat(unit8s, length) {
	var unit8 = create(length);
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
//modified from https://github.com/crypto-browserify/sha.js/blob/master/sha1.js
function sha1(key, data) {
	key = create(key);
	data = create(data);
	const blocksize = 64;
	var zeroBuffer = create(blocksize, 0);
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
				buf2 = concat([buf2, create(intSize, 0)], length);
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
		var next = create(hashSize);
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
	data = concat([data], data.length);
	if (key.length > blocksize) {
		key = sha12(key);
	} else if (key.length < blocksize) {
		key = concat([key, zeroBuffer], blocksize);
	}
	var ipad = create(blocksize),
		opad = create(blocksize);
	for (var i = 0; i < blocksize; i++) {
		ipad[i] = key[i] ^ 54;
		opad[i] = key[i] ^ 92;
	}
	const size1 = ipad.length + data.length;
	const hash = sha12(concat([ipad, data], size1));
	const size2 = ipad.length + hash.length;
	const result = sha12(concat([opad, hash], size2));
	//  bytes to base64
	const output = [];
	for (let i = 0; i < result.length; i++)
		output.push(String.fromCharCode(result[i]));
	return btoa(output.join(""));
}
function parseXML(xml, tagName) {
	if (!xml) return "";
	const tag = xml.querySelector(tagName);
	if (!tag) return "";
	return tag.textContent;
}
function getOSSDate(input) {
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

function getOSSHeaders(headers2) {
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
	const stringToSign = [
		method,
		"",
		options.headers["Content-Type"],
		options.headers["x-oss-date"],
		getOSSHeaders(options.headers),
		`${resource}`.replace(resource.protocol, "").replace(/\=$/, "").trim(),
	].join("\n");

	const signature = sha1(options.accessKeySecret, stringToSign);
	const authorization = `OSS ${options.accessKeyId}:${signature}`;
	const url = new URL(`${protocol}${host}${pathname}?${search}`);
	const headers = options.headers;
	const timeout = options.timeout;
	return new Promise((resolve) => {
		const xhr = new XMLHttpRequest();
		xhr.onload = () => resolve(xhr);
		xhr.onerror = () => resolve(xhr);
		xhr.ontimeout = () => resolve(xhr);
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
function getParts(file, partSize) {
	const fileSize = file.size;
	const minPartSize = 100 * 1024;
	if (!fileSize >= minPartSize) return { size: 1, slice: [] };
	partSize = partSize || 1 * 1024 * 1024;
	const max = 10 * 1e3;
	const size = Math.ceil(fileSize / partSize);
	const safeSize = Math.ceil(fileSize / max);
	if (partSize < safeSize) {
		partSize = safeSize;
		console.warn(
			`partSize has been set to ${partSize}, because the partSize you provided causes partNumber to be greater than ${max}`
		);
	}
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

async function namedRequest(method, options, body) {
	const xhr = await request(method, options, body);
	if (xhr.status < 200 || xhr.status >= 300) {
		var text = xhr.statusText;
		const status = xhr.status;
		if (xhr.responseXML) {
			const xml = xhr.responseXML;
			const code = parseXML(xml, "Code");
			const message2 = parseXML(xml, "Message");
			const requestId = parseXML(xml, "RequestId");
			const hostId = parseXML(xml, "HostId");
			text = [
				`Status:${status}`,
				`Code:${code}`,
				`Message:${message2}`,
				`RequestId:${requestId}`,
				`HostId:${hostId}`,
			].join("\n\n");
		}
		throw new Error(text);
	}
	const url = new URL(xhr.responseURL);
	const uploadId =
		url.searchParams.get("uploadId") || parseXML(xhr.responseXML, "UploadId");
	const result = {
		headers: xhr.getAllResponseHeaders(),
		etag: JSON.parse(xhr.getResponseHeader("etag")),
		status: xhr.status,
		name: options.object,
		url: url.toString(),
	};
	if (uploadId) result.uploadId = uploadId;
	return result;
}
async function completeMultipartUpload(options, uploadId, jobs) {
	const completeOption = {
		...options,
		subres: { uploadId },
	};
	completeOption.headers["Content-Type"] = "application/xml";
	const xml = buildCompleteMultipartUploadXML(jobs);
	return await namedRequest("POST", completeOption, xml);
}
export default class TinyOSS {
	constructor(options) {
		this.options = {};
		if (options) this.setOptions(options);
		this.upload = this.multipartUpload.bind(this);
	}
	async put(name, file, headers = {}) {
		const options = this.getOptions(name, file);
		options.headers = { ...options.headers, ...headers };
		return await namedRequest("PUT", options, file);
	}
	async multipartUpload(name, file, { partSize, headers } = {}) {
		const { size, slice } = getParts(file, partSize);
		if (size == 1) return await this.put(name, file, headers);
		const options = this.getOptions(name, file, headers);
		//  get UploadId
		const { uploadId } = await namedRequest("POST", options);
		const done = await Promise.all(
			Array.from({ length: size }, async (_, index) => {
				const partNumber = index + 1;
				try {
					const part = slice[partNumber - 1];
					const subres = {
						partNumber,
						uploadId,
					};
					const body = file.slice(part.start, part.end);
					const partOptions = { ...options, subres };
					const { etag } = await namedRequest("PUT", partOptions, body);
					return { partNumber, etag };
				} catch (error) {
					const message = [`Failed to upload part${partNumber}`, error.message];
					error.message = message.join("\n\n");
					throw error;
				}
			})
		);
		return await completeMultipartUpload(options, uploadId, done);
	}
	getOptions(name, file) {
		const version = "2022.04.1";
		const userAgent = `aliyun-sdk-js/${version}/` + navigator.userAgent;
		return {
			...this.options,
			object: name.replace(/^\/+/, ""),
			subres: { uploads: "" },
			headers: {
				"Content-Type": file.type,
				"x-oss-date": getOSSDate(),
				"x-oss-security-token": this.options.stsToken,
				"x-oss-user-agent": userAgent,
			},
		};
	}
	setOptions(opts) {
		this.options = Object.assign(
			{
				region: "oss-cn-hangzhou",
				internal: false,
				secure: false,
				timeout: 6e4,
				bucket: null,
				endpoint: new URL(
					"https://" + opts.region + ".aliyuncs.com"
				).toString(),
				accessKeyId: opts.accessKeyId.trim(),
				accessKeySecret: opts.accessKeySecret.trim(),
			},
			opts
		);
	}
}
function buildCompleteMultipartUploadXML(result) {
	const xml = result
		.sort((a, b) => a.partNumber - b.partNumber)
		.map(buildPartXML);
	xml.unshift(`<?xml version="1.0" encoding="UTF-8"?>`);
	xml.unshift(`<CompleteMultipartUpload>`);
	xml.push(`</CompleteMultipartUpload>`);
	return xml.join("\n");
	function buildPartXML({ partNumber, etag }) {
		let xml = "<Part>";
		xml += "<PartNumber>" + partNumber + "</PartNumber>";
		xml += "\n";
		xml += "<ETag>" + etag + "</ETag>";
		xml += "\n";
		xml += "</Part>";
		return xml;
	}
}
