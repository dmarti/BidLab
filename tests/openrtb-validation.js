
const validateBidRequest = (bidRequest) => {
    const errors = [];
    if (!bidRequest.id) errors.push("Missing 'id'");
    if (!Array.isArray(bidRequest.imp) || bidRequest.imp.length === 0) {
        errors.push("Missing or empty 'imp' array");
    } else {
        bidRequest.imp.forEach((imp, i) => {
            if (!imp.id) errors.push(`imp[${i}] missing 'id'`);
            if (!imp.banner && !imp.video && !imp.native) {
                errors.push(`imp[${i}] must have one of 'banner', 'video', or 'native'`);
            }
            if (imp.banner) {
                if (!imp.banner.w && !imp.banner.h && !imp.banner.format) {
                    errors.push(`imp[${i}].banner missing 'w', 'h', or 'format'`);
                }
            }
        });
    }
    if (!bidRequest.site && !bidRequest.app) errors.push("Missing 'site' or 'app' object");
    if (!bidRequest.device) errors.push("Missing 'device' object");
    if (!bidRequest.user) errors.push("Missing 'user' object");
    return { valid: errors.length === 0, errors };
};

const validateBidResponse = (bidResponse) => {
    const errors = [];
    if (!bidResponse.id) errors.push("BidResponse missing 'id'");
    if (!Array.isArray(bidResponse.seatbid) || bidResponse.seatbid.length === 0) {
        errors.push("BidResponse missing or empty 'seatbid' array");
    } else {
        bidResponse.seatbid.forEach((sb, i) => {
            if (!Array.isArray(sb.bid) || sb.bid.length === 0) {
                errors.push(`seatbid[${i}] missing or empty 'bid' array`);
            } else {
                sb.bid.forEach((b, j) => {
                    if (!b.id) errors.push(`seatbid[${i}].bid[${j}] missing 'id'`);
                    if (!b.impid) errors.push(`seatbid[${i}].bid[${j}] missing 'impid'`);
                    if (b.price === undefined) errors.push(`seatbid[${i}].bid[${j}] missing 'price'`);
                    if (!b.adm) errors.push(`seatbid[${i}].bid[${j}] missing 'adm'`);
                });
            }
        });
    }
    return { valid: errors.length === 0, errors };
};

// Test data based on App.js implementation
const testBidRequest = {
    id: "req-test-123",
    at: 2,
    tmax: 2000,
    imp: [{
        id: "1",
        banner: { w: 300, h: 250, format: [{w: 300, h: 250}] },
        bidfloor: 0.10
    }],
    site: { id: "bidlab-demo", domain: "bidlab.ai", page: "https://bidlab.ai/" },
    device: { ua: "NodeTest", language: "en" },
    user: { id: "user-mock-123" }
};

const testBidResponse = {
    id: "resp-test-456",
    seatbid: [{
        seat: "appnexus",
        bid: [{
            id: "bid-test-789",
            impid: "1",
            price: 5.50,
            adm: "<html>Test ad</html>",
            crid: "crid-appnexus-001",
            w: 300,
            h: 250,
            adomain: ["appnexus.com"]
        }]
    }],
    cur: "USD"
};

const reqResult = validateBidRequest(testBidRequest);
const resResult = validateBidResponse(testBidResponse);

console.log("BidRequest Valid:", reqResult.valid);
if (!reqResult.valid) console.error("Req Errors:", reqResult.errors);

console.log("BidResponse Valid:", resResult.valid);
if (!resResult.valid) console.error("Res Errors:", resResult.errors);

if (!reqResult.valid || !resResult.valid) {
    process.exit(1);
} else {
    console.log("All OpenRTB compliance tests passed.");
}
