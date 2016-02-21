
var MgsType = {
  1: 'Null',
  2: 'Text',
  3: 'Stream',
  4: 'Map',
  5: 'Object',
  6: 'Bytes',
};


var MgsReverse = {};
reverse(MgsType, MgsReverse);


module.exports = { 
  //
  // key: 数字
  // value: 名称
  //
  MgsType    : MgsType
  
  //
  // key: 名称
  // value: 数字
  //
  MgsReverse : MgsReverse
};


function reverse(from, to) {
  for (var i in reverse) {
    to[ reverse[i] ] = i;
  }
}