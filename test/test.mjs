import Xipper from "../js/Xipper.mjs";

test('Initalize Xipper', () => {
    let xipper = new Xipper();
});
test('Cloak a string', () => {
    let xipper = new Xipper();
    let result = xipper.cloak("abcdabcdabcdabcdabcdabcdabcdabcd","a string");
    console.log(result);
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