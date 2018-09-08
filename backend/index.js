const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const express = require('express')

const bodyParser = require('body-parser');
const cors = require('cors');

// region app
const app = express();

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// enable CORS - Cross Origin Resource Sharing
app.use(cors());
// endregion

mongoose.connect('mongodb://localhost/test');

const BalanceEntrySchema = Schema({
    address: String,
    value: String
});

const SignatureSchema = Schema({
    signer: String,
    signature: String
});

const BillSchema = Schema({
    name: String,
    state: String,
    fullySigned: Boolean,
    totalAmount: Number,
    totalBalanceChange: [BalanceEntrySchema],
    balanceChange: [BalanceEntrySchema],
    parts: [BalanceEntrySchema],
    payments: [BalanceEntrySchema],
    signatures: [SignatureSchema],
    group: { type: Schema.Types.ObjectId, ref: 'Group' },
    timestamp: {
        type: Date,
        // `Date.now()` returns the current unix timestamp as a number
        default: Date.now
    }
});

const GroupModel = mongoose.model('Group', Schema({
    _id: String,
    name: String,
    numParticipants: Number,
    bills: [BillSchema]
}, { _id: false }));

const BillModel = mongoose.model('Bill', BillSchema);

const main = async () => {
    app.post('/group', async (req, res) => {
        console.log('body', req.body);

        const group = new GroupModel({
            _id: req.body.address + (Math.random() * 100).toString(), // random for testing with the same id
            name: req.body.name,
            numParticipants: req.body.numParticipants
        });

        await group.save();
        console.log('group saved');

        res.json(group);
    });

    app.post('/group/:group_id/bill', async (req, res) => {
        console.log('body', req.body);

        GroupModel.findById(req.params.group_id, (err, group) => {
            const bill = new BillModel({
                name: req.body.name,
                state: req.body.state,
                signatures: req.body.signatures,
                balanceChange: req.body.balanceChange,
                totalBalanceChange: req.body.totalBalanceChange,
                parts: req.body.parts,
                payments: req.body.payments,
                fullySigned: req.body.fullySigned || false,
                totalAmount: req.body.totalAmount
            });

            group.bills.push(bill);

            group.save();

            res.json(bill);
        });
    });

    app.get('/group/:group_id/bills', async (req, res) => {
        GroupModel.findById(req.params.group_id, (err, group) => {
            res.json(group.bills);
        });
    });

    app.get('/group/:group_id/bills_not_signed/:address_id', async (req, res) => {
        GroupModel.findById(req.params.group_id, (err, group) => {
            const notSigned = group.bills.filter(({ signatures }) => {
                return signatures.filter(({ signer }) => signer.toLowerCase() === req.params.address_id.toLowerCase()).length > 0
            });

            res.json(notSigned);
        });
    });

    app.post('/group/:group_id/bills/:bill_id/add-signature', async (req, res) => {
        if (!req.body.signature) {
            return res.json({
                error: 'No signature'
            });
        }

        GroupModel.findById(req.params.group_id, async (err, group) => {
            const bill = group.bills.id(req.params.bill_id);

            if (bill.signatures.find(({ signer }) => signer.toLowerCase() === req.body.signature.signer.toLowerCase())) {
                return res.json({
                    error: 'Signature already present.'
                });
            }

            bill.signatures.push(req.body.signature);

            if (bill.signatures.length == numParticipants) {
                bill.fullySigned = true;
            }

            await group.save();

            res.json(bill);
        });
    });

    app.listen(3000, () => console.log('Example app listening on port 3000!'))
};

main();
