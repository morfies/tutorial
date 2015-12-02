// run with babel-node
function tag(literals, ...substitutions){
  console.log(literals); // [ 'Hello world, ', '. There are ', ' people here.' ]
  console.log(substitutions); // ['Morfies', 90] 
  let result = '';
  for(var i = 0; i < substitutions.length; i++){
    result += literals[i];
    result += substitutions[i];
  }
  result += literals[i];
  return result;
}

let who = 'Morfies', num = 90;
let str = tag`Hello world, ${who}. There are ${num} people here.`;

console.log(str);


let multi = `first line\nsecond line`;
let mstr = String.raw`first line\nsecond line`;

console.log(multi);
console.log(mstr);

// upper-case 
function upper(literals, ...substitutions){
  let result = '';
  for(let i = 0; i < literals.length; i++){
    result += literals[i];
    if(i < substitutions.length){
      result += (substitutions[i]+'').toUpperCase();
    }
  }
  return result;
}
let m = 'morfies';
let upperStr = upper`'morfies''s upperCase is ${m}`;

console.log(upperStr);



