const bitcoinjs = require('bitcoinjs-lib')
const bs58check = require('bs58check')
const bip32 = bitcoinjs.bip32

const coininfo = require('coininfo')
const litecoin = coininfo.litecoin.main
const litecoinBitcoinJSLib = litecoin.toBitcoinJS()

// For this example using Trezor Wallet LTC Extended Public Key
const extended_key = 'Mtub2seED9hMfEPvBhi1Ha7TAUmC3rnbvj7tANPuUXV8yFsVJ4UATGK97HevL3nJKc4TY9Qv1KSk1dXASRL2socY58b5WdVRVDQUuz28ptaXAtL'
const type = extended_key.substr(0,4)

/*
Litecoin  0x019da462 - Ltub 0x019d9cfe - Ltpv P2PKH or P2SH m/44'/2'
Litecoin  0x01b26ef6 - Mtub 0x01b26792 - Mtpv P2WPKH in P2SH  m/49'/1'
*/

function convertAnyAddressToLtub(extended_key, type) {
  if(type == "Ltub"){
    return extended_key
  }else{
    let data = bs58check.decode(extended_key)
    data = data.slice(4)
    data = Buffer.concat([Buffer.from('019da462','hex'), data])
    return bs58check.encode(data)
  }
}

const ltub = convertAnyAddressToLtub(extended_key, type)
const accountNode = bip32.fromBase58(ltub, litecoinBitcoinJSLib)

/*
Pay-to-Public-Key-Hash (P2PKH)
Pay-to-Witness-Public-Key-Hash (P2WPKH)
Pays To Script Hash (P2SH)
- Segregated Witness Wallet (P2SH-P2WPKH)
 -> For making payments, segwit wallet do transform a given P2SH address to a scriptPubKey, and create a transaction.
 -> For receiving payments, segwit wallet create a P2SH address based on a P2WPKH script,
*/
function getAddress (node, network, type) {
  if(type == "Ltub"){
    return bitcoinjs.payments.p2pkh({ pubkey: node.publicKey, network }).address
  }else{
    //segwit
    const p2wpkh = bitcoinjs.payments.p2wpkh({ pubkey: node.publicKey, network })
    return bitcoinjs.payments.p2sh({ redeem: p2wpkh, network }).address
  }
}

let firstFifteenReceiveAddress = []
const recvNode = accountNode.derive(0) // derive(0): Receiving Node & derive(1): Change Node

for (let i = 0; i < 15; i++) {
  firstFifteenReceiveAddress.push(getAddress(recvNode.derive(i), litecoinBitcoinJSLib, type))
}

console.log(firstFifteenReceiveAddress)
