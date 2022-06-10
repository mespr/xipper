import Xipper from "../Xipper.mjs";

test('Initalize Xipper', () => {
    let xipper = new Xipper();
});
test('Cloak a string', () => {
    let xipper = new Xipper();
    console.log("abcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd".length)
    let result = xipper.cloak("abcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd","This is a test");
    console.log(result);
});
test('DeCloak a string', () => {
    let xipper = new Xipper({charset:"scrambls"});
    let result = xipper.cloak("abcdabcdabcdabcdabcdabcdabcdabcd","a string");
    result = xipper.decloak("abcdabcdabcdabcdabcdabcdabcdabcd","ſдņƯť ќхЖРƷ ");
    console.log(result);
});
test('Fail to DeCloak a string given the wrong key', () => {
    let xipper = new Xipper({charset:"scrambls"});
    let result = xipper.cloak("abcdabcdabcdabcdabcdabcdabcdabcd","a string");
    try {
        result = xipper.decloak("Ebcdabcdabcdabcdabcdabcdabcdabcd","ſдņƯť ќхЖРƷ ");
    } catch(e) {
        console.log(e);
    }
});
test('Make token from object', () => {
    let xipper = new Xipper({spacing:false,charset:"extended"});
    let obj = {root:"https://nytimes.com",url:"https://nytimes.com/world",type:"text/html"}
    console.log(obj);
    let result = xipper.cloak("abcdabcdabcdDk35CbcDkS8Hnwcdabcd",JSON.stringify(obj));
    console.log(result);
    result = xipper.decloak("abcdabcdabcdDk35CbcDkS8Hnwcdabcd",result);
    console.log(JSON.parse(result));
});

process.exit(); // success

function test(message,method) {
    try {
        method();
        console.log('\x1b[32m%s\x1b[0m',"✓ "+message);
    } catch(e) {
        console.log(message);
        console.log('\x1b[31m%s\x1b[0m',e.message);
        process.exit(1); // fail
    }
}