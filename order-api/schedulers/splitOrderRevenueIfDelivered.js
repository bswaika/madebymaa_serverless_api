const { Split, Account, Token, Env } = require('../models');
const { RZP, FCM } = require('../providers');

// Call this every 48 hours
// Payment Split Window: 48hours

// const SPLIT_FACTOR = 0.65; //Query from Business Params table

const splitOrderRevenueIfDelivered = async(event, context) => {
    console.log(`=========Starting SORID @ Time: ${Date.now()}`);
    try {
        const SPLIT_FACTOR = await Env.findOne({ key: "SPLIT_FACTOR" });
        if (!SPLIT_FACTOR) throw new Error('InternalServerError');
        console.log('Fetching Splits...');
        const splits = await Split.find({ status: false });
        if (!splits.length)
            return;
        console.log(splits.length);
        let count = 0;
        console.log('Validating and Executing Splits...');
        for (const split of splits) {
            console.log('-----------------------------------');
            const account = await Account.findOne({ firebaseID: split.sellerID });
            if (!account) continue;
            if (await RZP.splitPayment({
                    payment_id: split.paymentID,
                    params: {
                        amount: SPLIT_FACTOR.value * split.amount,
                        currency: 'INR',
                        account: account.accountID
                    }
                })) {
                console.log(`${split._id} Executed...`);
                count++;
                split.status = true;
                await split.save();

                const sellerToken = await Token.findOne({ firebaseID: split.sellerID, entity: 'seller' });
                if (sellerToken) {
                    const result = await FCM.notify({
                        title: 'Account Transfer Initiated',
                        body: `Rs. ${SPLIT_FACTOR.value * split.amount / 100}`
                    }, sellerToken.token);
                    if (result) {
                        console.log(`${split._id} Notified...`);
                    }
                }
            }
            console.log('-----------------------------------');
        }
        console.log(`=========Stopping SORID @ Time: ${Date.now()} | Processed ${splits.length} splits | Split ${count} payments...`);
        return;
    } catch (err) {
        console.log(err);
        return;
    }
}

module.exports = splitOrderRevenueIfDelivered;