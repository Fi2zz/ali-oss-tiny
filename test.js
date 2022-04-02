const options = {
	stringToSign:
		"PUT\n\nimage/jpeg\nSat, 02 Apr 2022 04:44:24 GMT\nx-oss-date:Sat, 02 Apr 2022 04:44:24 GMT\nx-oss-security-token:CAISgAJ1q6Ft5B2yfSjIr5aEAPbAhL0QhYq6R1DSvDE2aeJav6j7tjz2IH1FendsCewZs/s/lWBT5/sflqJ5RptBTHvNYc5x6MzpG5oM9c2T1fau5Jko1beHewHKeTOZsebWZ+LmNqC/Ht6md1HDkAJq3LL+bk/Mdle5MJqP+/UFB5ZtKWveVzddA8pMLQZPsdITMWCrVcygKRn3mGHdfiEK00he8ToitvzlkpbEu0OB0gGilbUvyt6vcsT+Xa5FJ4xiVtq55utye5fa3TRYgxowr/on0vIYqWuY447NUgkKskjbKZTZ/tYqNwtwfrB/HLVf6eDhibh/vOjChwRZJdGF0Gw/GoABYj3zU896eztnsa6UhVTFMny07DVBf+TM5AytMCRsQzFGJSZ+u6e2ogdJAy6jvERVm8nokD8mS6t2K6VOMq2kux7jLE0qRDkOQ63cfuGRx6XQxc06LhONUBl9srb/4YJrD2Iba6af74aPYjetATq64SESgKFypBlksKDWSoZTXXU=\nx-oss-user-agent:aliyun-sdk-js/2022.04.1/Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36\n/slapp-bella/tmp/dev/2022_04_02T04_44_24.196Z_rn4HmB_CM_Hotel_Thumb_660x600__2_.jpeg?uploads",
	accessKeySecret: "8czg632n4mje3amXsxecM25ceJCqtwaLZpQwEVEa5CW4",

	signature: "4Fc+GZUu6yyRe6PwLukCozLBCos=",
};

import { sha1 } from "./sha1.js";
const signature = "4Fc+GZUu6yyRe6PwLukCozLBCos=";
var calc_signature = sha1(options.accessKeySecret, options.stringToSign);
// calc_signature = base64(calc_signature);

console.log({
	"options.signature": signature,
	calc_signature: calc_signature,
	same: signature == calc_signature,
});

export function base64(unit8) {
	const output = [];
	for (let i = 0, { length } = unit8; i < length; i++)
		output.push(String.fromCharCode(unit8[i]));
	return btoa(output.join(""));
}
