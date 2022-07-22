import "./styles.css";
import totp from "totp-generator";
import QRCode from "qrcode";

const qrcode = document.getElementById("qrcode");
const currentKey = document.getElementById("currentkey");
const keyField = document.getElementById("key");
keyField.addEventListener("keyup", (e) => {
  updateCode();
});

// https://github.com/google/google-authenticator/wiki/Key-Uri-Format#secret
// REQUIRED: The secret parameter is an arbitrary key value encoded in Base32
// according to RFC 3548. The padding specified in RFC 3548 section 2.2 is not
// required and should be omitted.
const base32Rex = (function () {
  const c = "[A-Z2-7]";
  let result = `^(?:${c}{8})*(?:`;
  for (let i = 1; i <= 3; i++) {
    const n = Math.ceil((8 * i) / 5);
    result += `${c}{${n}}(={${8 - n}})?|`;
  }
  result += `${c}{7}=?)?$`;
  console.log(result);
  return new RegExp(result);
})();

let lastKey = "";
function updateCode() {
  const epoch = new Date().getTime();
  const key = keyField.value;

  if (!base32Rex.test(key)) {
    keyField.style.backgroundColor = "#ffeeee";
    return;
  }
  keyField.style.backgroundColor = "";

  if (key !== lastKey) {
    const url = `otpauth://totp/Example:test@example.com?secret=${encodeURI(
      key
    )}&issuer=Example`;
    console.log(url);
    QRCode.toCanvas(qrcode, url);
    currentKey.innerHTML = key;
    lastKey = key;
  }

  let html = "";

  for (let i = -4; i < 5; i++) {
    let token = totp(key, { timestamp: epoch + 30000 * i });
    token = token.replace(/(\d{3})(\d{3})/, "$1 $2");
    if (i === 0) {
      html += `<strong>${token}</strong> ⬅⏰<br>`;
    } else {
      html += `${token}<br>`;
    }
  }

  document.getElementById("app").innerHTML = `
<div>
<p>OLD<br>
${html}
NEW</p>
</div>
`;
  const expire = 30000 - (epoch % 30000);
  setTimeout(updateCode, expire);
}

function updateTime() {
  const epoch = new Date().getTime();
  const expire = 30000 - (epoch % 30000);
  const time = Math.floor(expire / 1000) + 1;
  document.getElementById("timer").innerHTML = time;
  setTimeout(updateTime, 100);
}

updateCode();
updateTime();
