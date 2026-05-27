
const validateOpenRTB = (bidRequest) => {
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

    if (!bidRequest.site && !bidRequest.app) {
        errors.push("Missing 'site' or 'app' object");
    }

    if (bidRequest.site) {
        if (!bidRequest.site.id && !bidRequest.site.domain) {
            errors.push("site object must have 'id' or 'domain'");
        }
    }

    if (!bidRequest.device) errors.push("Missing 'device' object");
    if (!bidRequest.user) errors.push("Missing 'user' object");

    return {
        valid: errors.length === 0,
        errors
    };
};

const mockBidRequest = {
    id: "bid-req-123",
    at: 2,
    tmax: 500,
    imp: [{
        id: "1",
        banner: {
            w: 300,
            h: 250,
            format: [{w: 300, h: 250}]
        },
        bidfloor: 0.50
    }],
    site: {
        id: "bidlab-demo",
        domain: "bidlab.ai",
        cat: ["IAB1"],
        page: "https://bidlab.ai/demo"
    },
    device: {
        ua: "Mozilla/5.0...",
        ip: "1.2.3.4",
        language: "en"
    },
    user: {
        id: "user-456"
    }
};

const result = validateOpenRTB(mockBidRequest);
console.log("Validation Result:", JSON.stringify(result, null, 2));

if (!result.valid) {
    console.error("OpenRTB Validation Failed!");
    process.exit(1);
} else {
    console.log("OpenRTB Validation Passed.");
}
