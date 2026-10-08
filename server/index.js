const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const keccak256 = require("ethereum-cryptography/keccak.js").keccak256;
const secp256k1 = require("ethereum-cryptography/secp256k1").secp256k1;

app.use(cors());
app.use(express.json());

const balances = {
  "02fad514f6884ccd5acb126f5b7cf72e0a7b15837bd108a25e1360f9b6e6685c76": 100,
  "028b75f21e7294dfa262cdaf598ea5bfa956964e4e853c7efcca8d1d040c06d4d9": 50,
  "02d5f8c4394aba207d08916c8c9da85209e4a5639ef4e496b6c0521803d35f52ac": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const transaction = req.body;
  console.log(transaction);
  const { sender, recipient, amount, hexSign } = transaction;

  const transactionData = sender + amount + recipient;
  const senderHash = keccak256(Uint8Array.from(transactionData));
  const isSigned = secp256k1.verify(hexSign, senderHash, sender);
  console.log("Is signed: ", isSigned);

  if (isSigned) {
    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    res.status(400).send({ message: "Not signed!" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}