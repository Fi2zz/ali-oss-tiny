# Ali-OSS-tiny

browser only ali-oss multipart upload

## Install

```bash
    yarn add ali-oss-tiny
    npm install ali-oss-tiny
```

## USAGE

```javascript
import aliOSSTiny from "ali-oss-tiny";
const oss = aliOSSTiny();
const sts = {
	region,
	accessKeyId,
	accessKeySecret,
	stsToken,
	bucket,
	secure: true,
	endpoint,
};
oss.setOptions(sts);
document.querySelector("#file").onchange = async (event) => {
	const file = event.target.files[0];
	try {
		const result = await oss.upload(file.name, file);
		console.log(result);
		//  {
		// 	url: "the url",
		// 	headers: {
		// 		"x-oss-request-id": "oss request id",
		// 		etag: "etag",
		// 	},
		// 	bucket: "your bucket",
		// 	etag: "etag",
		// 	key: "key",
		// }
	} catch (error) {}
};
```
