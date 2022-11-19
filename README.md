# Blockhouse
BH Marketplace for the NEAR MetaBUILD Hackathon

## Contracts addresses
Mumbai Testnet (V3 - Upgradable and Gassless):

- HouseT_NFT = _
- BH_MarketPlace = _
- FungibleBlockhouse = _
  
## Remarks
### TODO Jonathan
- Add wallet connect
- Add Blockhouse branding
- Add deploy workflow

### TODO Aurelien
- Implement multisig security, when important actions (withdraws and upgrades) can only be taken if both Aurelien and Jonathan agrees on it and sign. (Gnosis Safe) (1 day) (see [here](https://docs.openzeppelin.com/defender/guide-upgrades))

See https://forum.openzeppelin.com/t/openzeppelin-upgrades-step-by-step-tutorial-for-hardhat/3580

### Done Aurelien
- Add gassless mode (see [here](https://docs.biconomy.io/products/enable-gasless-transactions/choose-an-approach-to-enable-gasless/eip-2771)) (1-2 days)
- Make all of them upgradable (see [here](https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable))
- Deploy and update automatically on a livechain with hardhat
- Write local test with hardhat
