
function toFibonacci(n) {
    if (n === 0) return "0";
    let fibs = [1, 2];
    while (fibs[fibs.length - 1] < n) {
        fibs.push(fibs[fibs.length - 1] + fibs[fibs.length - 2]);
    }
    
    let result = new Array(fibs.length).fill('0');
    let remaining = n;
    for (let i = fibs.length - 1; i >= 0; i--) {
        if (remaining >= fibs[i]) {
            result[i] = '1';
            remaining -= fibs[i];
        }
    }
    // GPP Fibonacci encoding: bit 1 is F(2)=1, bit 2 is F(3)=2, ...
    // And it ends with a '1' delimiter.
    // The result array above is [F(2), F(3), ...]
    // We need to find the last '1' and then append another '1'.
    let lastOne = result.lastIndexOf('1');
    let truncated = result.slice(0, lastOne + 1);
    return truncated.join('') + '1';
}

function generateGPPHeader(sectionIds) {
    let bits = "";
    // NumEntries: 12 bits
    bits += sectionIds.length.toString(2).padStart(12, '0');
    
    for (let id of sectionIds) {
        // Single: 1 bit (0 for single)
        bits += "0";
        // Value: Fibonacci
        bits += toFibonacci(id);
    }
    
    // Pad to multiple of 6
    while (bits.length % 6 !== 0) {
        bits += "0";
    }
    
    // Convert to Base64URL
    const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let encoded = "";
    for (let i = 0; i < bits.length; i += 6) {
        let chunk = bits.substring(i, i + 6);
        encoded += base64Chars[parseInt(chunk, 2)];
    }
    
    return "DB" + encoded;
}

console.log("Section 2:", generateGPPHeader([2]));
console.log("Section 7:", generateGPPHeader([7]));
console.log("Section 8:", generateGPPHeader([8]));
console.log("Section 9:", generateGPPHeader([9]));
console.log("Section 2, 7:", generateGPPHeader([2, 7]));
