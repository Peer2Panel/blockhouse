// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@opengsn/contracts/src/BaseRelayRecipient.sol";

import "./BH_MarketPlace.sol"; //using the whitelist contract
import "./BH_FungibleBlockhouse.sol";

//https://ethereum.stackexchange.com/questions/66039/remix-contract-creation-initialization-returns-data-with-length-of-more-than-2


//Initializable already included in ERC721Upgradeable
contract BH_HouseT is BaseRelayRecipient, AccessControlUpgradeable, ERC721Upgradeable, ERC721URIStorageUpgradeable, ERC721EnumerableUpgradeable { 


    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
    address public USDC_contract_address; 
    address Aurelien_address;
    address Jonathan_address;
    address BH_address;
    address owner;
    address contract_creator;

    //HouseT related code
    address public BHMarketplace_contract_address; //BHMarketplace address on Polygon
    address public BHFungibleBlockhouse_contract_address; //BHFungibleBlockhouse address on Polygon
    mapping (address => uint256) public Entilted_amount;
    mapping (address => uint256) public Withdrawn_amount;
    mapping (uint256 => uint256) public Generated_profit_per_panel;
    mapping (address => uint256) public Generated_profit_per_user;
    mapping (address => uint256) public Last_update_address;
    mapping (uint256 => uint256) public Last_update_HouseT;
    EnumerableSetUpgradeable.AddressSet HouseT_whitelist; //for most useres who passed KYC
    EnumerableSetUpgradeable.AddressSet HouseT_whitelist_restricted; //for chinese or US users, who might have restrictions, not implemented at the moment
    mapping (address => string) public Owner_names; //Name of whitelisted address owners
    
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIds;
    uint256 public burned_HouseT;
    bool use_whitelist;
    string public override versionRecipient;
    uint256 public max_House_amount;
    mapping (address => bool) public Allowed_addresses_unlimited;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant BH_ROLE = keccak256("BH_ROLE");

   modifier onlyAdmin {
      require(hasRole(ADMIN_ROLE, _msgSender()), "Only Admin-BH");
      _;
   }

   modifier onlyBH {
      require(hasRole(BH_ROLE, _msgSender()), "Only BH");
      _;
   }

    function void () public {}

    function initialize(address owner_, address _USDC_contract_address, address _forwarder, bool _use_whitelist) public initializer
    {

        __ERC721_init("HouseToken", "HouseT");
        _setTrustedForwarder(_forwarder);

        USDC_contract_address = _USDC_contract_address;
        //USDC_contract_address = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; //USDC address on Polygon
        //USDC_contract_address = 0xeE36A294369bE640Ce839F195f430A461ab6DA89; // USDC address on Polygon Testnet (Mumbai)
        Jonathan_address = 0xe7E3E925E5dcFeaF5C5CEBfbc6EfD4B404B0e607;
        Aurelien_address = 0xC117E7247be4830D169da13427311F59BD25d669;
        BH_address = 0xe7E3E925E5dcFeaF5C5CEBfbc6EfD4B404B0e607; 
        owner = owner_; 
        contract_creator = _msgSender();
        use_whitelist = _use_whitelist;
        max_House_amount = 2;
        versionRecipient = "2.2.0";
        Owner_names[owner] = 'Owner';
        Owner_names[address(this)] = 'BH_HouseT';
        Owner_names[Aurelien_address] = 'Aurelien Pelissier (BH)';
        Owner_names[Jonathan_address] = 'Jonathan Lehner (BH)';
        EnumerableSetUpgradeable.add(HouseT_whitelist,address(this));
        EnumerableSetUpgradeable.add(HouseT_whitelist,Aurelien_address);
        EnumerableSetUpgradeable.add(HouseT_whitelist,Jonathan_address);
        EnumerableSetUpgradeable.add(HouseT_whitelist,owner);
        Allowed_addresses_unlimited[owner] = true;
        Allowed_addresses_unlimited[Aurelien_address] = true;
        Allowed_addresses_unlimited[Jonathan_address] = true;

        //Roles
        _setupRole(ADMIN_ROLE, owner);
        _setupRole(ADMIN_ROLE, Jonathan_address);
        _setupRole(ADMIN_ROLE, Aurelien_address);

        _setupRole(BH_ROLE, owner);
        _setupRole(BH_ROLE, Jonathan_address);
        _setupRole(BH_ROLE, Aurelien_address);
        _setupRole(BH_ROLE, BH_address);
        _setupRole(BH_ROLE, address(this));

    }

    function is_using_whitelist() public view returns(bool)
    {
        return(use_whitelist);
    }

    function change_using_whitelist(bool _use_whitelist) public onlyAdmin
    {
        use_whitelist = _use_whitelist;
    }

    function exists(uint256 tokenID) public view returns(bool)
    {
        return(_exists(tokenID));
    }


    function update_trusted_forwarder(address forwarder_) public onlyAdmin
    {
        _setTrustedForwarder(forwarder_);
    }


    function update_addresses(address _BHMarketplace_contract_address, address _BHFungibleBlockhouse_contract_address) public 
    {
         require(_msgSender() == owner || _msgSender() == contract_creator || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address, "Only BH");
         BHMarketplace_contract_address = _BHMarketplace_contract_address;
         BHFungibleBlockhouse_contract_address = _BHFungibleBlockhouse_contract_address;
         EnumerableSetUpgradeable.add(HouseT_whitelist,BHMarketplace_contract_address);
         EnumerableSetUpgradeable.add(HouseT_whitelist,BHFungibleBlockhouse_contract_address);
         Owner_names[BHMarketplace_contract_address] = 'BHMarketplace';
         Owner_names[BHFungibleBlockhouse_contract_address] = 'BHFungibleBlockhouse';
         _setupRole(BH_ROLE, _BHMarketplace_contract_address);
         _setupRole(BH_ROLE, _BHFungibleBlockhouse_contract_address);

    } 

    function get_all_HouseT_info() public view returns(address[] memory, string[] memory, bool[] memory, bool[] memory, uint256[][4] memory) 
    //Need to do that because stack depth limited to 7 output variables max
    //owner_list, metadata, is_listed, is_staked, book_value, listing_price
    {
        uint l = _tokenIds.current();
        address[] memory address_list = new address[](l);
        string[] memory metadata_list = new string[](l);
        bool[] memory is_listed_list = new bool[](l);
        bool[] memory is_staked_list = new bool[](l);
        uint256[] memory book_value_list = new uint256[](l);
        uint256[] memory Listing_price_list = new uint256[](l);
        uint256[] memory Generated_profit_list = new uint256[](l);
        uint256[] memory remaining_payment_list = new uint256[](l);
        uint TokenID=0;
        for (TokenID = 0; TokenID < l; TokenID++) {
            if (_exists(TokenID)) {
                bool staked;
                bool listed;
                address address_ = ownerOf(TokenID);
                if (address_ == BHMarketplace_contract_address) {
                    address_ = BH_MarketPlace(BHMarketplace_contract_address).HouseT_Owner(TokenID);
                    listed = true;
                }
                if (address_ == BHFungibleBlockhouse_contract_address) {
                    address_ = BH_FungibleBlockhouse(BHFungibleBlockhouse_contract_address).HouseT_Owner(TokenID);
                    staked = true;
                }

                address_list[TokenID] = address_;
                metadata_list[TokenID] = tokenURI(TokenID);
                is_listed_list[TokenID] = listed;
                is_staked_list[TokenID] = staked;
                book_value_list[TokenID] = BH_FungibleBlockhouse(BHFungibleBlockhouse_contract_address).HouseT_Values(TokenID);
                remaining_payment_list[TokenID] = BH_FungibleBlockhouse(BHFungibleBlockhouse_contract_address).HouseT_Remaining_payments(TokenID);
                Listing_price_list[TokenID] = BH_MarketPlace(BHMarketplace_contract_address).HouseT_Price(TokenID);
                Generated_profit_list[TokenID] = Generated_profit_per_panel[TokenID];
            }
        }

        uint256[][4] memory concatenated_uint = [book_value_list,Listing_price_list,Generated_profit_list,remaining_payment_list];

        return (address_list, metadata_list, is_listed_list, is_staked_list, concatenated_uint);
    }

    function get_owned_HouseTs(address _address) public view returns(uint256)
    {
        uint256 HouseT_direct_ownership = balanceOf(_address);
        uint256 Listed_HouseT = BH_MarketPlace(BHMarketplace_contract_address).Listed_HouseTs(_address);
        uint256 Staked_HouseT = BH_FungibleBlockhouse(BHFungibleBlockhouse_contract_address).Staked_HouseTs(_address);
        return (HouseT_direct_ownership + Listed_HouseT + Staked_HouseT);
    }

    function change_max_HouseT_amount(uint256 _max_House_amount) public onlyAdmin {
        max_House_amount = _max_House_amount;
    }

    function add_unlimted_HouseT_allowance(address _address) public onlyAdmin {
        Allowed_addresses_unlimited[_address] = true;
    }

    function remove_unlimted_HouseT_allowance(address _address) public onlyAdmin {
        Allowed_addresses_unlimited[_address] = false;
    }





    function mint_HouseT_with_info(address _to, string memory _tokenURI, uint256 USD_book_value, uint256 remaining_payments) public onlyBH
    {
        uint256 newTokenID = _tokenIds.current();
        mint_HouseT(_to, _tokenURI);
        BH_FungibleBlockhouse(BHFungibleBlockhouse_contract_address).update_HouseT_value(newTokenID, USD_book_value);
        BH_FungibleBlockhouse(BHFungibleBlockhouse_contract_address).update_HouseT_remaining_payments(newTokenID, remaining_payments);
    }



    // tokenURI is metadata
    function mint_HouseT(address _to, string memory _tokenURI) public onlyBH
    //URI  is a json string that contains the relevant infos
    {
        uint256 newTokenID = _tokenIds.current();
        _mint(_to,newTokenID);
        _setTokenURI(newTokenID, _tokenURI);
        Last_update_HouseT[newTokenID] = block.timestamp;

        _tokenIds.increment();

    }

    function update_URI(uint256 _tokenID, string memory _tokenURI) public onlyBH
    {
        _setTokenURI(_tokenID, _tokenURI);
    }

    function update_URI_batch(uint256[] memory _tokenIDs, string[] memory _tokenURIs) public onlyBH
    {
        uint i=0;
        uint l = _tokenURIs.length;
        for (i = 0; i < l; i++) {
            _setTokenURI(_tokenIDs[i], _tokenURIs[i]);
            }
    }

    function burn(uint256 House_tokenID) public{ //Should generally not be used
        require(_isApprovedOrOwner(_msgSender(), House_tokenID), "ERC721Burnable: caller is not owner nor approved");
        _burn(House_tokenID);
        burned_HouseT = burned_HouseT +1;
    }

    function replace_HouseT(uint256 House_tokenID, address _to, string memory _tokenURI) public onlyBH{ //Should generally not be used, only in case we need to replace a token
        require(House_tokenID <=_tokenIds.current(), "You can only replace existing tokens");

        //verify if token was not already burned
        if (_exists(House_tokenID)) {
            require(_isApprovedOrOwner(_msgSender(), House_tokenID), "ERC721Burnable: caller is not owner nor approved");
            _burn(House_tokenID);
        }
        else {
            burned_HouseT = burned_HouseT - 1;
        }
        _mint(_to,House_tokenID);
        _setTokenURI(House_tokenID, _tokenURI);
    }

    function mint_HouseT_batch(address to, string[] memory _tokenURIs) public onlyBH{
        uint i=0;
        uint l = _tokenURIs.length;
        for (i = 0; i < l; i++) {
            mint_HouseT(to, _tokenURIs[i]);
            }
    } 


    function mint_HouseT_with_info_batch(address _to, string[] memory _tokenURIs, uint256[] memory USD_book_values, uint256[] memory remaining_payments) public onlyBH //URI  is a json string that contains the relevant infos
    {
        uint i=0;
        uint l = _tokenURIs.length;
        for (i = 0; i < l; i++) {
            uint256 newTokenID = _tokenIds.current();
            mint_HouseT(_to, _tokenURIs[i]);
            BH_FungibleBlockhouse(BHFungibleBlockhouse_contract_address).update_HouseT_value(newTokenID, USD_book_values[i]);
            BH_FungibleBlockhouse(BHFungibleBlockhouse_contract_address).update_HouseT_remaining_payments(newTokenID, remaining_payments[i]);
        }

    }    


    function get_HouseT_amount() public view returns(uint256) 
    {
        return _tokenIds.current();
    }

    function HouseT_IDs_of(address _address) public view returns(uint256[] memory) {
        uint l = balanceOf(_address);
        uint256[] memory Token_list = new uint256[](l);
        uint i=0;
        for (i = 0; i < l; i++) {
            Token_list[i] = tokenOfOwnerByIndex(_address, i);
            }
        return Token_list;
    }

    




    //// ---------- APPROVAL FUNCTIONS ---------- ////
    function approve_listing(uint256 House_tokenID) public
    {
        //Authorize the contract to move the HouseT token (necessary for BH marketplace)
        if (ownerOf(House_tokenID) == _msgSender()) {
            approve(BHMarketplace_contract_address,  House_tokenID);
        }
        
    }
    function approve_listing_batch(uint256[] memory House_tokenIDs) public
    {
        //Authorize the contract to move the HouseT tokens (necessary for BH marketplace)
        uint i=0;
        uint l = House_tokenIDs.length;
        for (i = 0; i < l; i++) {
            if (_exists(House_tokenIDs[i])) {
                approve_listing(House_tokenIDs[i]);
            }
        }
    }
    function approve_staking(uint256 House_tokenID) public
    {
        //Authorize the contract to move the HouseT token (necessary for BH marketplace)
        if (ownerOf(House_tokenID) == _msgSender()) {
            approve(BHFungibleBlockhouse_contract_address,  House_tokenID);
        }
    }
    function approve_staking_batch(uint256[] memory House_tokenIDs) public
    {
        //Authorize the contract to move the HouseT tokens (necessary for BH marketplace)
        uint i=0;
        uint l = House_tokenIDs.length;
        for (i = 0; i < l; i++) {
            if (_exists(House_tokenIDs[i])) {
                approve_staking(House_tokenIDs[i]);
            }
        }
    }
    //// ------------------------------------ ////





    function get_HouseT_ownerOf(uint256 HouseT_tokenID) public view returns(address){
        address address_ = ownerOf(HouseT_tokenID);
            if (address_ == BHMarketplace_contract_address) {
                address_ = BH_MarketPlace(BHMarketplace_contract_address).HouseT_Owner(HouseT_tokenID);
            }
        return address_;
    }

    //List of all HouseT holders for each tokenIDs
    function get_list_of_HouseT_owner() public view returns(address[] memory) {

        uint l = _tokenIds.current();
        address[] memory address_list = new address[](l);
        uint TokenID=0;
        for (TokenID = 0; TokenID < l; TokenID++) {
            if (_exists(TokenID)) {
                address address_ = ownerOf(TokenID);
                if (address_ == BHMarketplace_contract_address) {
                    address_ = BH_MarketPlace(BHMarketplace_contract_address).HouseT_Owner(TokenID);
                }

                address_list[TokenID] = address_;
            }
        }

        return address_list; //returns the list of wallets currently owning HouseT
    } 








    //Function below are related to HouseT owner withdrawing USD profits:

    function Add_HouseT_entilted_amount(uint256 HouseT_tokenID, uint256 amount) public onlyBH{
        //Update users found for a given address
        
        bool allowed = true;
        if (_msgSender() == BH_address)
        {
            allowed = ( (block.timestamp - Last_update_HouseT[HouseT_tokenID]) > 1000) && (amount < 100*1e6); //USDC has 6 decimals
        }
        require(allowed, "Last token update too soon ago or amount above limit");

        address _address = get_HouseT_ownerOf(HouseT_tokenID);
        Last_update_HouseT[HouseT_tokenID] = block.timestamp;
        Last_update_address[_address] = block.timestamp;
        Entilted_amount[_address] += amount;
        Generated_profit_per_panel[HouseT_tokenID] += amount;
        Generated_profit_per_user[_address] += amount;

        if (_address == BHFungibleBlockhouse_contract_address)
        {
            //tell the staking contract that income was added
            BH_FungibleBlockhouse(BHFungibleBlockhouse_contract_address).add_HouseT_blocked_income(HouseT_tokenID,amount);
        }
    }

    function Add_HouseT_entilted_amount_batch(uint256[] memory HouseT_tokenIDs, uint256[] memory amounts) public {
        //require(_msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address || _msgSender() == BH_address, "Only BH staff can use this function");
        uint i=0;
        uint l = HouseT_tokenIDs.length;
        for (i = 0; i < l; i++) {
            Add_HouseT_entilted_amount(HouseT_tokenIDs[i], amounts[i]);
        }
    } 

    function withdraw_profit() public {
        //Withdraw available founds for HouseT owner
        if (use_whitelist == true) {
            require(is_in_whitelist(_msgSender()), 'only whitelisted address can claim USDC');
        }
        address _address = _msgSender();
        uint256 amount_to_withdraw = Entilted_amount[_address];
        require (amount_to_withdraw > 0, "You dont have any USDC to withdraw");
        ERC20(USDC_contract_address).transfer(_address, amount_to_withdraw);
        Entilted_amount[_address] = 0;
        Withdrawn_amount[_address] += amount_to_withdraw;
    } 

    function distribute_profit(address to_address) public onlyBH{
        //Withdraw available founds to a HouseT owner (made by BH on behalf of the owner)
        if (use_whitelist == true) {
            require(is_in_whitelist(_msgSender()), 'only whitelisted address can claim USDC');
        }
        uint256 amount_to_withdraw = Entilted_amount[to_address];
        require (amount_to_withdraw > 0, "This user doesnt have any USDC to withdraw");
        ERC20(USDC_contract_address).transfer(to_address, amount_to_withdraw);
        Entilted_amount[to_address] = 0;
        Withdrawn_amount[to_address] += amount_to_withdraw;
    } 

    function distribute_profits_to_all_address() public onlyBH{
        //Withdraw available founds to all eligible HouseT owner

        address[] memory HouseT_owners = get_list_of_HouseT_owner();
        uint l = HouseT_owners.length;
        uint i=0;
        bool allowed = true;
        for (i = 0; i < l; i++) {
            address to_address = HouseT_owners[i];
            if (use_whitelist == true) {
                allowed = is_in_whitelist(_msgSender());
            }

            if (allowed)
            {
                uint256 amount_to_withdraw = Entilted_amount[to_address];
                if (amount_to_withdraw > 0)
                {
                    ERC20(USDC_contract_address).transfer(to_address, amount_to_withdraw);
                }
                Entilted_amount[to_address] = 0;
                Withdrawn_amount[to_address] += amount_to_withdraw;
            }
            
        }
    } 

    function check_current_profits(address _address) public view returns(uint256) {
        //Check what current profits are available
        return Entilted_amount[_address];
    } 




    function is_in_whitelist(address _address) public view returns(bool) {
        bool is_in = EnumerableSetUpgradeable.contains(HouseT_whitelist,_address);
        return is_in;
    }







    //Owner only functions
    function withdraw_USDC_funds(uint256 amount) public onlyAdmin{ //Should only be used in case of problems
        uint256 current_balance = ERC20(USDC_contract_address).balanceOf(address(this));
        require (amount > 0, "Amount should be higher than 0");
        require (current_balance >= amount, "Not enough USDC to withdraw");
        ERC20(USDC_contract_address).transfer(owner, amount);
    }


    //Owner only functions
    function withdraw_all_USDC_funds() public onlyAdmin{ //Should only be used in case of problems
        uint256 current_balance = ERC20(USDC_contract_address).balanceOf(address(this));
        require (current_balance > 0, "Current USDC founds are empty");
        ERC20(USDC_contract_address).transfer(owner, current_balance);
    }


    //Adjust entilted amount in case there is a problem:
    function Change_HouseT_owner_entilted_amount(address _address, uint256 amount) public onlyAdmin{
        //Update user found for a given address
        Last_update_address[_address] = block.timestamp;
        Entilted_amount[_address] = amount;
    }

    //Adjust HouseT generated usd in case of problem:
    function Change_HouseT_Generated_amount(uint256 HouseT_token_ID, uint256 amount) public onlyBH{
        Last_update_HouseT[HouseT_token_ID] = block.timestamp;
        Generated_profit_per_panel[HouseT_token_ID] = amount;
    }  

    //Adjust HouseT generated usd in case of problem:
    function Change_HouseT_Generated_amount_per_user(address _address, uint256 amount) public onlyBH{
        Generated_profit_per_user[_address] = amount;
    }  



    /* !!!!! Removed due to contract size limit !!!!!
    
    //Adjust entilted amount in case there is a problem:
    function Change_HouseT_owner_entilted_amount_batch(address[] memory addresses, uint256[] memory amounts) public onlyAdmin{
        uint i=0;
        uint l = addresses.length;
        for (i = 0; i < l; i++) {
            Change_HouseT_owner_entilted_amount(addresses[i], amounts[i]);
        }
    }  

    //Adjust HouseT generated usd in case of problem:
    function Change_HouseT_Generated_amount_batch(uint256[] memory HouseT_token_IDs, uint256[] memory amounts) public onlyBH{
        uint i=0;
        uint l = HouseT_token_IDs.length;
        for (i = 0; i < l; i++) {
            Change_HouseT_Generated_amount(HouseT_token_IDs[i], amounts[i]);
        }
    }  

    //Adjust HouseT generated usd in case of problem:
    function Change_HouseT_Generated_amount_per_user_batch(address[] memory _addresses, uint256[] memory amounts) public onlyBH{
        uint i=0;
        uint l = _addresses.length;
        for (i = 0; i < l; i++) {
            Change_HouseT_Generated_amount_per_user(_addresses[i], amounts[i]);
        }
    }  
    */




    //BaseRelayRecipient override
    function _msgSender() internal view override(ContextUpgradeable, BaseRelayRecipient)
        returns (address sender) {
        sender = BaseRelayRecipient._msgSender();
    }

    function _msgData() internal view override(ContextUpgradeable, BaseRelayRecipient)
        returns (bytes calldata) {
        return BaseRelayRecipient._msgData();
    }



    //Additional adjustements functions for multiple derived contract (TokenURI and Enumerable)
    //https://forum.openzeppelin.com/t/how-do-inherit-from-erc721-erc721enumerable-and-erc721uristorage-in-v4-of-openzeppelin-contracts/6656/2


    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    
    function _beforeTokenTransfer(address from, address to, uint256 inte, uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._beforeTokenTransfer(from, to, inte, tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }


    //function _baseURI() internal pure override returns (string memory) {
    //    return "https://foo.com/token/";
    //}


}
