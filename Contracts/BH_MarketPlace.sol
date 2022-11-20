// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@opengsn/contracts/src/BaseRelayRecipient.sol";

import "./BH_HouseT.sol";


contract BH_MarketPlace is BaseRelayRecipient, Initializable {

    uint256 percentage_taken_from_transaction;
    address public HouseT_contract_address; //HouseT address on Polygon
    address public BHFungibleBlockhouse_contract_address; //BHFungibleBlockhouse_contract_address
    address public USDC_contract_address;
    address Aurelien_address;
    address Jonathan_address;
    address BH_address;
    address owner;
    uint256 public Comission_USDC;
    string public override versionRecipient;
    
    mapping (address => uint256) public Listed_HouseTs;
    mapping (uint256 => uint256[]) public Price_history;  //
    mapping (uint256 => address) public HouseT_Owner;     //Keep track of the true NFT owner
    mapping (uint256 => uint256) public HouseT_Price;     //Listing price of the HouseT in USDC
    mapping (uint256 => uint256) public HouseT_Bid;
    mapping (uint256 => address) public Address_Bid;


    function void () public {}

    function initialize(address _HouseT_contract_address, address _BHFungibleBlockhouse_contract_address, address _owner, address _USDC_contract_address, address forwarder_) public initializer
    {
        
        _setTrustedForwarder(forwarder_);
        
        owner = _owner; //The owner can withdraw all the money from commission
        HouseT_contract_address = _HouseT_contract_address;
        BHFungibleBlockhouse_contract_address = _BHFungibleBlockhouse_contract_address;
        Comission_USDC = 0; //Keep track of the USDC received by the contract from commission
        percentage_taken_from_transaction = 1;
        versionRecipient = "2.2.0";

        USDC_contract_address = _USDC_contract_address;
        //USDC_contract_address = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // USDC address on Polygon
        //USDC_contract_address = 0xeE36A294369bE640Ce839F195f430A461ab6DA89; // USDC address on Polygon Testnet (Mumbai)
        Aurelien_address = 0xe7E3E925E5dcFeaF5C5CEBfbc6EfD4B404B0e607;
        Jonathan_address = 0xC117E7247be4830D169da13427311F59BD25d669;
        BH_address = 0xe7E3E925E5dcFeaF5C5CEBfbc6EfD4B404B0e607;
    } 


    function update_trusted_forwarder(address forwarder_) public
    {
        require(_msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address, "Only BH");
        _setTrustedForwarder(forwarder_);
    }


    function change_commission(uint256 _percentage_taken_from_transaction) public {
        require(_msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address, "Only BH");
        percentage_taken_from_transaction = _percentage_taken_from_transaction;
    }

     function get_HouseT_owners_in_Marketplace() public view returns(address[] memory) {

        uint l = BH_HouseT(HouseT_contract_address).get_HouseT_amount();
        address[] memory address_list = new address[](l);
        uint TokenID=0;
        for (TokenID = 0; TokenID < l; TokenID++) {
            address address_ = HouseT_Owner[TokenID];
            address_list[TokenID] = address_;
        }

        return address_list; //returns the list of wallets currently owning HouseT
    }   

    function is_listed (uint256 House_tokenID) public view returns(bool)
    {
        return (HouseT_Price[House_tokenID] != 0);
    }

    function last_sell_price(uint256 House_tokenID) public view returns(uint256)
    {
        uint lastIndex = Price_history[House_tokenID].length-1;
        return (Price_history[House_tokenID][lastIndex]);
    }


    function list_HouseT (uint256 House_tokenID, uint256 USDC_price) public  {

        //Verify if sender has the HouseT NFT
        require(BH_HouseT(HouseT_contract_address).ownerOf(House_tokenID) == _msgSender(), "You dont own or already listed this HouseT");

        // transfer the HouseT NFT from the sender to this contract
        BH_HouseT(HouseT_contract_address).transferFrom(_msgSender(), address(this), House_tokenID); //transferFrom(from, to, tokenId)

        //add listing informations
        HouseT_Owner[House_tokenID] = _msgSender();
        HouseT_Price[House_tokenID] = USDC_price;
        Listed_HouseTs[HouseT_Owner[House_tokenID]] += 1;
    }

    function list_HouseT_batch (uint256[] memory House_tokenIDs, uint256[] memory USDC_prices) public  {

        uint i=0;
        uint l = House_tokenIDs.length;
        for (i = 0; i < l; i++) {
            list_HouseT(House_tokenIDs[i], USDC_prices[i]);
            }
    }

    function update_listing_price_HouseT (uint256 House_tokenID, uint256 new_USDC_price) public  {

        //Verify if sender has the HouseT NFT
        require(HouseT_Owner[House_tokenID] == _msgSender(), "You dont own or already sold this HouseT");
        require(BH_HouseT(HouseT_contract_address).ownerOf(House_tokenID) == address(this), "You did not list, already sold, or are not the owner of this HouseT token");
        require(new_USDC_price > HouseT_Bid[House_tokenID], "New price should be higher than current bid");

        //update listing informations
        HouseT_Price[House_tokenID] = new_USDC_price;
    }

    function unlist_HouseT (uint256 House_tokenID) public  {

        //Verify if sender is owner of HouseTs
        require(HouseT_Owner[House_tokenID] == _msgSender(), "You did not list, already sold, or are not the owner of this HouseT token");

        //Verify if NFT is in the contract
        require(BH_HouseT(HouseT_contract_address).ownerOf(House_tokenID) == address(this), "This HouseT token is not in the contract, i.e. was already withdrawn or sold");

        // transfer the HouseT NFT from this contract to the owner
        BH_HouseT(HouseT_contract_address).transferFrom(address(this),_msgSender(), House_tokenID);

        //remove listing informations
        Listed_HouseTs[HouseT_Owner[House_tokenID]] -= 1;
        delete HouseT_Price[House_tokenID];
        delete HouseT_Owner[House_tokenID];
        delete HouseT_Bid[House_tokenID];
        delete Address_Bid[House_tokenID];
    }

    function buy_HouseT (uint256 House_tokenID) public  {

        bool allowed_to_buy = (BH_HouseT(HouseT_contract_address).get_owned_HouseTs(_msgSender()) < BH_HouseT(HouseT_contract_address).max_House_amount()) || BH_HouseT(HouseT_contract_address).Allowed_addresses_unlimited(_msgSender()) == true;
        require(allowed_to_buy == true, 'you already own the maximum amount of HouseT');

        //Verify if NFT is in the contract
        require(BH_HouseT(HouseT_contract_address).ownerOf(House_tokenID) == address(this), "This HouseT is not available for buy");
        uint256 users_found = ERC20(USDC_contract_address).balanceOf(_msgSender());
        require(users_found >= HouseT_Price[House_tokenID], "You dont have enough money to buy this pannel");

        ERC20(USDC_contract_address).transferFrom(_msgSender(), address(this), HouseT_Price[House_tokenID]);
        // Pay the previous owner USDC minus transaction fee, the contract keep the rest
        uint256 amount_to_send = (100-percentage_taken_from_transaction)*HouseT_Price[House_tokenID]/100;
        ERC20(USDC_contract_address).transfer(HouseT_Owner[House_tokenID], amount_to_send);
        Comission_USDC += percentage_taken_from_transaction*HouseT_Price[House_tokenID]/100;

        // Transfer the HouseT NFT from this contract to the new owner
        BH_HouseT(HouseT_contract_address).transferFrom(address(this),_msgSender(), House_tokenID);
        
        // Remove the HouseT from the listing
        Listed_HouseTs[HouseT_Owner[House_tokenID]] -= 1;
        Price_history[House_tokenID].push(HouseT_Price[House_tokenID]);
        delete HouseT_Price[House_tokenID];
        delete HouseT_Owner[House_tokenID];
        delete HouseT_Bid[House_tokenID];
        delete Address_Bid[House_tokenID];
    }


    function place_bid (uint256 House_tokenID, uint256 USDC_amount) public  { //Can only place bid if higher than the existing bid

        bool allowed_to_buy = (BH_HouseT(HouseT_contract_address).get_owned_HouseTs(_msgSender()) < BH_HouseT(HouseT_contract_address).max_House_amount()) || BH_HouseT(HouseT_contract_address).Allowed_addresses_unlimited(_msgSender()) == true;
        require(allowed_to_buy == true, 'you already own the maximum amount of HouseT');

        require(USDC_amount > HouseT_Bid[House_tokenID], "New bid needs to be higher than current bid");
        require(USDC_amount < HouseT_Price[House_tokenID], "New bid needs to be lower than current price");

        address previous_bidder_address = Address_Bid[House_tokenID];
        uint256 previous_bid = HouseT_Bid[House_tokenID];

        //New bid
        ERC20(USDC_contract_address).transferFrom(_msgSender(), address(this), USDC_amount);

        //return money to previous bidder
        if (previous_bid > 0) {
            ERC20(USDC_contract_address).transfer(previous_bidder_address, previous_bid);
        }

        HouseT_Bid[House_tokenID] = USDC_amount;
        Address_Bid[House_tokenID] = _msgSender();

    }


    function withdraw_bid (uint256 House_tokenID) public  {

        require(_msgSender() == Address_Bid[House_tokenID], "You need to be the latest bidder to withdraw, or the asset was already sold");

        ERC20(USDC_contract_address).transfer(Address_Bid[House_tokenID], HouseT_Bid[House_tokenID]);
        delete HouseT_Bid[House_tokenID];
        delete Address_Bid[House_tokenID];

    }


    function accept_bid (uint256 House_tokenID) public  {

        require(_msgSender() == HouseT_Owner[House_tokenID], "You need to be the current HouseT owner");

        //Such conflict may happen if someone withdraw his bid shortly before the owner accept bid.
        require(HouseT_Bid[House_tokenID] > 0, "Dont accept a bid of 0 !");
        require(Address_Bid[House_tokenID] != address(0), "Dont send your NFT to null address");

        // Pay the previous owner USDC minus transaction fee, the contract keep the rest
        uint256 amount_to_send = (100-percentage_taken_from_transaction)*HouseT_Bid[House_tokenID]/100;
        ERC20(USDC_contract_address).transfer(HouseT_Owner[House_tokenID], amount_to_send);
        Comission_USDC += percentage_taken_from_transaction*HouseT_Bid[House_tokenID]/100;

        // Transfer the HouseT NFT from this contract to the new owner
        BH_HouseT(HouseT_contract_address).transferFrom(address(this),_msgSender(), House_tokenID);

        // Remove the HouseT from the listing
        Listed_HouseTs[HouseT_Owner[House_tokenID]] -= 1;
        Price_history[House_tokenID].push(HouseT_Price[House_tokenID]);
        delete HouseT_Price[House_tokenID];
        delete HouseT_Owner[House_tokenID];
        delete HouseT_Bid[House_tokenID];
        delete Address_Bid[House_tokenID];

    }




    //Owner only functions


    function get_USDC_Balcance() public view returns(uint256) { //Current banlance of the contract
        uint256 current_balance = ERC20(USDC_contract_address).balanceOf(address(this));
        return current_balance;
    }


    function withdraw_commission_USDC() public { //BH can withdraw the comission
        require(_msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address || _msgSender() == BH_address, "Only BH");
        uint256 current_balance = ERC20(USDC_contract_address).balanceOf(address(this));
        require (current_balance < ERC20(USDC_contract_address).balanceOf(address(this)), "Current USDC founds are less than comission");
        ERC20(USDC_contract_address).transfer(owner, Comission_USDC);
    }


    function Update_commission_USDC(uint256 _CommissionUSDC) public { //SHould only be used in case of problems
        require(_msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address, "Only BH");
        Comission_USDC = _CommissionUSDC;
    }


    function withdraw_USDC_funds(uint256 amount) public { //Should only be used in case of problems
        require(_msgSender() == owner);
        uint256 current_balance = ERC20(USDC_contract_address).balanceOf(address(this));
        require (amount > 0, "Amount should be higher than 0");
        require (current_balance > amount, "Not enough USDC to withdraw");
        ERC20(USDC_contract_address).transfer(owner, amount);
    }


    function withdraw_all_USDC_funds() public { //Should only be used in case of problems
        require(_msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address, "Only BH");
        uint256 current_balance = ERC20(USDC_contract_address).balanceOf(address(this));
        require (current_balance > 0, "Current USDC founds are empty");
        ERC20(USDC_contract_address).transfer(owner, current_balance);
    }

   function withdraw_HouseT(uint256 House_tokenID) public { //Should only be used in case of problems
        require(_msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address, "Only BH");
        require(address(this) == BH_HouseT(HouseT_contract_address).ownerOf(House_tokenID), "This token is not in the market place");
        BH_HouseT(HouseT_contract_address).transferFrom(address(this), owner, House_tokenID);
    }

   function withdraw_all_HouseTs() public { //Should only be used in case of problems
        require(_msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address, "Only BH");
        uint l = BH_HouseT(HouseT_contract_address).get_HouseT_amount();
        uint TokenID=0;
        for (TokenID = 0; TokenID < l; TokenID++) {
            if (address(this) == BH_HouseT(HouseT_contract_address).ownerOf(TokenID)) {
                BH_HouseT(HouseT_contract_address).transferFrom(address(this), owner, TokenID);
            }
        }
    }


    //Functions for Price Stability Mechanism (PSM)

    function available_funds() public view returns(uint256) {
        return Comission_USDC;
    }

    function transfert_funds_to_FS_contract(uint256 amount_to_transfert) public {
        require(_msgSender() == BHFungibleBlockhouse_contract_address || _msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address || _msgSender() == BH_address, "Only BH");
        require(Comission_USDC >= amount_to_transfert);
        Comission_USDC = Comission_USDC - amount_to_transfert;
        ERC20(USDC_contract_address).transfer(BHFungibleBlockhouse_contract_address, amount_to_transfert);
    }
    

}
