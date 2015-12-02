function htmlEscape(literals, ...substitutions){
  let result = '';
  for (let i = 0; i < literals.length; i++) {
    result += literals[i];
    if(i < substitutions.length){
      let tmp = substitutions[i];
      tmp = tmp.replace(/&/g, "&amp;") //order matters
               .replace(/>/g, "&gt;")
               .replace(/</g, "&lt;");
      result += tmp;
    }
  }
  return result;
}

var userInput = `<script>alert(1);</script>`;
var str = htmlEscape`<div>${userInput}</div>`;

console.log(str);
