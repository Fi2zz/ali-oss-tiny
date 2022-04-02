# Ali-OSS-tiny

Browser only ali-oss multipart upload

No IE support

Supported

- .put(name,file, headers)
- .multipartUpload(name,file, {headers,partSize,onProgress})
- .setOptions(sts)

## Install

```bash
    yarn add ali-oss-tiny
    npm install ali-oss-tiny
```

## How to use

```javascript
import TinyOSS from "ali-oss-tiny";
const sts = {
	region,
	accessKeyId,
	accessKeySecret,
	stsToken,
	bucket,
	secure,
	endpoint,
};
const oss = new TinyOSS(sts);
// or
// oss.setOptions(sts)
//  oss.multipartUpload(name,file, {headers?, partSize?})
const multipartResult = await oss.multipartUpload(file.name, file);
console.log(multipartUploadResult);
		//  {
		// 	url: "the url",
		// 	headers:string,
		// 	etag: "etag",
		// 	name: "key",
		// 	status
		// }
// oss.put(name,file, headers?)
const putResult = await oss.put(file.name, file, headers);
console.log(putResult);
		//  {
		// 	url: "the url",
		// 	headers:string,
		// 	etag: "etag",
		// 	name: "key",
		// 	status
		// }
};
```
