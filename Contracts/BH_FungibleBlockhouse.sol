// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@opengsn/contracts/src/BaseRelayRecipient.sol";

import "./BH_HouseT.sol";
import "./BH_MarketPlace.sol"; //using the whitelist contract


//Initializable already included in ERC20Upgradeable
contract BH_FungibleBlockhouse is BaseRelayRecipient, ERC20Upgradeable, ERC20BurnableUpgradeable {


    uint256 public collateral_ratio;
    uint256 public interrest_rate;

    address public USDC_contract_address;
    address public HouseT_contract_address; //HouseT address on Polygon
    address public BHMarketplace_contract_address;
    address Aurelien_address;
    address Jonathan_address;
    address BH_address;
    address owner;
    address contract_creator;

    mapping (address => uint256) public Staked_HouseTs;
    mapping (uint256 => address) public HouseT_Owner;
    mapping (uint256 => uint256) public HouseT_Values;
    mapping (uint256 => uint256) public HouseT_Remaining_payments;
    mapping (uint256 => uint256) public HouseT_blocked_income;
    mapping (uint256 => uint256) public Borrowed_amount;
    mapping (uint256 => uint256) public Timestamp_borrowed;
    string public override versionRecipient;

    /*
    Modifier that could be used for future updates
    modifier onlyAdmin {
        require(BH_HouseT(HouseT_contract_address).hasRole(BH_HouseT(HouseT_contract_address).ADMIN_ROLE(), _msgSender()), "Only Admin-BH");
        _;
    }
    modifier onlyBH {
        require(BH_HouseT(HouseT_contract_address).hasRole(BH_HouseT(HouseT_contract_address).BH_ROLE(), _msgSender()), "Only BH");
        _;
    }
    */

    function void () public {}

    function initialize (address _HouseT_contract_address, address _owner, address _USDC_contract_address, address forwarder_) public initializer
    {
        
        __ERC20_init("FBH", "FBH");
        _setTrustedForwarder(forwarder_);
        
        owner = _owner; //The owner can withdraw all the money
        contract_creator = _msgSender();
        HouseT_contract_address = _HouseT_contract_address;
        collateral_ratio = 85;
        interrest_rate = 3;
        versionRecipient = "2.2.0";

        USDC_contract_address = _USDC_contract_address;
        //USDC_contract_address = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; //USDC address on Polygon
        //USDC_contract_address = 0xeE36A294369bE640Ce839F195f430A461ab6DA89; // USDC address on Polygon Testnet (Mumbai)
        Aurelien_address = 0xe7E3E925E5dcFeaF5C5CEBfbc6EfD4B404B0e607;
        Jonathan_address = 0xC117E7247be4830D169da13427311F59BD25d669;
        BH_address = 0xe7E3E925E5dcFeaF5C5CEBfbc6EfD4B404B0e607;

    } 

    function update_addresses(address _BHMarketplace_contract_address) public 
    {
         require(_msgSender() == owner || _msgSender() == contract_creator || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address, "Only BH");
         BHMarketplace_contract_address = _BHMarketplace_contract_address;

    } 

    function update_interrest_rate(uint256 _rate) public
    {
        require(_msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address, "Only BH");
        interrest_rate = _rate;
    }

    function update_collateral_ratio(uint256 _ratio) public
    {
        require(_msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address, "Only BH");
        collateral_ratio = _ratio;
    }

    function update_trusted_forwarder(address forwarder_) public
    {
        require(_msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address, "Only BH");
        _setTrustedForwarder(forwarder_);
    }

    function _msgSender() internal view override(ContextUpgradeable, BaseRelayRecipient)
        returns (address sender) {
        sender = BaseRelayRecipient._msgSender();
    }

    function _msgData() internal view override(ContextUpgradeable, BaseRelayRecipient)
        returns (bytes calldata) {
        return BaseRelayRecipient._msgData();
    }

    function is_staked(uint256 House_tokenID) public view returns(bool)
    {
        return (HouseT_Owner[House_tokenID] != 0x0000000000000000000000000000000000000000);
    }

    function stake_HouseT(uint256 House_tokenID) public {

        //Verify if sender has the HouseT NFT
        require(BH_HouseT(HouseT_contract_address).ownerOf(House_tokenID) == _msgSender(), "You dont own this HouseT");
        if (BH_HouseT(HouseT_contract_address).is_using_whitelist()== true) {
            require(BH_HouseT(HouseT_contract_address).is_in_whitelist(_msgSender()), 'Only whitelisted addresses can use the loan service');
        }


        // transfer the HouseT NFT from the sender to this contract
        BH_HouseT(HouseT_contract_address).transferFrom(_msgSender(), address(this), House_tokenID); //transferFrom(from, to, tokenId)

        //Mint FBH to the stake
        uint256 FBHamount = HouseT_Values[House_tokenID]*collateral_ratio/100;
        _mint(_msgSender(), FBHamount);

        HouseT_Owner[House_tokenID] = _msgSender();
        Borrowed_amount[House_tokenID] = FBHamount;
        Timestamp_borrowed[House_tokenID] = block.timestamp;
        Staked_HouseTs[HouseT_Owner[House_tokenID]] += 1;
    }   

    function stake_HouseT_batch(uint256[] memory House_tokenIDs) public {
        uint i=0;
        uint l = House_tokenIDs.length;
        for (i = 0; i < l; i++) {
            stake_HouseT(House_tokenIDs[i]);
            }
    }

    function unstake_HouseT(uint256 House_tokenID) public {

        //Verify if sender is owner of HouseTs
        require(HouseT_Owner[House_tokenID] == _msgSender(), "You already withdrawn, or are not the owner of this HouseT token");

        //Verify if NFT is in the contract
        require(BH_HouseT(HouseT_contract_address).ownerOf(House_tokenID) == address(this), "This HouseT token is not in the contract, i.e. was already withdrawn");

        //Transfer and Burn FBHtokens
        uint256 FBH_balance = balanceOf(_msgSender());
        uint256 FBHamount = get_FBHamount_due(House_tokenID);
        require (FBH_balance >= FBHamount, "Not enough FBH to unstake HouseT");
        _burn(_msgSender(),FBHamount);

        //Transfert House NFT back to user
        BH_HouseT(HouseT_contract_address).transferFrom(address(this), _msgSender(), House_tokenID); //transferFrom(from, to, tokenId)

        //Transfert income from the panel to user
        

        uint256 amount_to_send = HouseT_blocked_income[House_tokenID];
        uint256 contract_balance = ERC20(USDC_contract_address).balanceOf(address(this));
        if ( contract_balance < amount_to_send)
        {   
            //withdraw HouseT income in case there isnt enough USD
            if (int(BH_HouseT(HouseT_contract_address).Entilted_amount(address(this))) >= int(amount_to_send) - int(contract_balance)) //the right part should never be negative
            {
                BH_HouseT(HouseT_contract_address).withdraw_profit();
            }
            else 
            {
                require(false, "There is not enough USD in the staking and HouseT contract, please contact BH staff"); //should never happen
            }
        }

        if (amount_to_send > 0) 
        {
            ERC20(USDC_contract_address).transfer(_msgSender(), uint256(amount_to_send));
        }
        
        
        //reset parameters
        Staked_HouseTs[HouseT_Owner[House_tokenID]] -= 1;
        delete HouseT_Owner[House_tokenID];
        delete Borrowed_amount[House_tokenID];
        delete Timestamp_borrowed[House_tokenID];
        HouseT_blocked_income[House_tokenID] = 0;
    }

    function unstake_HouseT_batch(uint256[] memory House_tokenIDs) public {
        uint i=0;
        uint l = House_tokenIDs.length;
        for (i = 0; i < l; i++) {
            unstake_HouseT(House_tokenIDs[i]);
            }
    }


    function update_HouseT_value(uint256 House_tokenID, uint256 USD_value) public { //Should be updated every month by BH after payment (Panel valuation for loan)
        require(_msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address || _msgSender() == BH_address || _msgSender() == HouseT_contract_address, "Only BH");
        
        bool allowed = true; //panel value should never ecxeed 1k, protect us against amlicious attack
        {
            allowed = (USD_value < 1000*1e6); //USDC has 6 decimals
        }
        require(allowed, "USD_value above limit");
        HouseT_Values[House_tokenID] = USD_value;
    }

    function update_HouseT_remaining_payments(uint256 House_tokenID, uint256 remaining_payments) public {
        require(_msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address || _msgSender() == BH_address || _msgSender() == HouseT_contract_address, "Only BH");
        HouseT_Remaining_payments[House_tokenID] = remaining_payments;
    }

    function update_HouseT_remaining_payments_batch(uint256[] memory House_tokenIDs, uint256[] memory remaining_payments) public {
        uint i=0;
        uint l = House_tokenIDs.length;
        for (i = 0; i < l; i++) {
            HouseT_Remaining_payments[House_tokenIDs[i]] = remaining_payments[i];
            }
    }

    
    function update_HouseT_value_batch(uint256[] memory House_tokenIDs, uint256[] memory USD_values) public { //Should be updated every month by BH after payment (Panel valuation for loan)
        require(_msgSender() == owner || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address || _msgSender() == BH_address, "Only BH");
        uint i=0;
        uint l = House_tokenIDs.length;
        for (i = 0; i < l; i++) {
            update_HouseT_value(House_tokenIDs[i], USD_values[i]);
            }
    }

    function add_HouseT_blocked_income(uint256 House_tokenID, uint256 USD_amount) public { //Should be updated every month by BH after payment (income adds to the previous one)
    //Note that this is made automatically by the HouseT contract when calling "Add_HouseT_entilted_amount"
        require(_msgSender() == owner || _msgSender() == HouseT_contract_address || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address, "Only BH");
        
        HouseT_blocked_income[House_tokenID] += USD_amount;
    }

    function update_HouseT_blocked_income(uint256 House_tokenID, uint256 USD_amount) public { //Should only be used in case of problem
        require(_msgSender() == owner || _msgSender() == HouseT_contract_address || _msgSender() == Aurelien_address || _msgSender() == Jonathan_address, "Only BH");
        HouseT_blocked_income[House_tokenID] = USD_amount;
    }





    //View only functions

    function get_collateral_value(uint256 House_tokenID) public view returns (uint256) {
        uint256 value = HouseT_Values[House_tokenID] + HouseT_blocked_income[House_tokenID];
        return value;
    }


    function get_FBHamount_due(uint256 House_tokenID) public view returns (uint256) {
        uint256 amount_due;
        if (is_staked(House_tokenID)) {
            uint256 loan_duration = block.timestamp - Timestamp_borrowed[House_tokenID];
            //uint256 amount_due = Borrowed_amount[House_tokenID]*(1 + loan_duration*interrest_rate/100/31971556); ////// Linear approximation
            ///uint256 amount_due = Borrowed_amount[House_tokenID]*exp(interrest_rate/100 * loan_duration/31971556);  /////// interrest rate is in %/year, assuming 1y =  365d + 5h + 59min + 16s
            
            //https://www.npmjs.com/package/solidity-math-utils?activeTab=readme#analyticmath
            //uint256 amount_due = Borrowed_amount[House_tokenID]*pow(27182182845904523536, 10000000000000000000, interrest_rate/100 * loan_duration, 31971556);

            //https://ethereum.stackexchange.com/questions/35819/how-do-you-calculate-compound-interest-in-solidity
            
            /*
            uint q = 31971556*100/interrest_rate;
            if (loan_duration > 0) {
                amount_due = fracExp(Borrowed_amount[House_tokenID], q, loan_duration , loan_duration );
            }
            */
            if (loan_duration > 0) {
                amount_due = Borrowed_amount[House_tokenID]*(1 + loan_duration*interrest_rate/100/31971556); ////// Linear approximation
            }
            else {
                amount_due = Borrowed_amount[House_tokenID];
            }
        }

        
        return amount_due;
    }



    function fracExp(uint k, uint q, uint n, uint p) public pure returns (uint) {
        // Computes `k * (1+1/q) ^ N`, with precision `p`. The higher
        // the precision, the higher the gas cost. It should be
        // something around the log of `n`. When `p == n`, the
        // precision is absolute (sans possible integer overflows). <edit: NOT true, see comments>
        // Much smaller values are sufficient to get a great approximation.
        uint s = 0;
        uint N = 1;
        uint B = 1;
        for (uint i = 0; i < p; ++i){
            s += k * N / B / (q**i);
            N  = N * (n-i);
            B  = B * (i+1);
        }
        return s;
    }


    //List of all HouseT holders for each token IDs and the amount of FBH they borrowed
    function get_list_of_HouseT_staker() public view returns(address[] memory, uint256[] memory) {

        uint l = BH_HouseT(HouseT_contract_address).get_HouseT_amount();
        address[] memory address_list = new address[](l);
        uint256[] memory FBH_borrow_amount_list = new uint256[](l);
        uint TokenID=0;
        for (TokenID = 0; TokenID < l; TokenID++) {
            address address_ = HouseT_Owner[TokenID];
            address_list[TokenID] = address_;
            FBH_borrow_amount_list[TokenID] = get_FBHamount_due(TokenID);
        }

        return (address_list, FBH_borrow_amount_list); //returns the list of wallets currently staking HouseT and the amount of FBH they owe
    }


    //List of all HouseT tokens an owner has and their borrowed FBH for each
    function get_list_of_HouseT_staked(address _address) public view returns (uint256[] memory, uint256[] memory) {

        uint256[] memory HouseT_IDs = BH_HouseT(HouseT_contract_address).HouseT_IDs_of(_address);
        uint i;
        uint l = HouseT_IDs.length;
        uint256[] memory FBH_borrow_amount_list = new uint256[](l);
        for (i = 0; i < l; i++) {
            uint256 TokenID = HouseT_IDs[i];
            FBH_borrow_amount_list[i] = get_FBHamount_due(TokenID);
            }

        return (HouseT_IDs, FBH_borrow_amount_list);
    }



    //Functions for Price Stability Mechanism (PSM)
    function exchange_FBH_TO_USDC(uint256 amount) public {

        require(balanceOf(_msgSender()) >= amount, "You don't own enough FBH to exchange");
        uint256 USDC_available_funds = ERC20(USDC_contract_address).balanceOf(address(this));
        uint256 USDC_available_funds_MarketPlace = BH_MarketPlace(BHMarketplace_contract_address).available_funds();
        uint256 total_available_funds = USDC_available_funds + USDC_available_funds_MarketPlace;
        require( total_available_funds >= amount, "Not enough USDC funds");

        if (USDC_available_funds < amount) {
            uint256 amount_to_transfert = amount - USDC_available_funds;
            BH_MarketPlace(BHMarketplace_contract_address).transfert_funds_to_FBH_contract(amount_to_transfert);
        }

        _burn(_msgSender(),amount);
        ERC20(USDC_contract_address).transfer(_msgSender(), amount);
    }


    function exchange_USDC_TO_FBH(uint256 amount) public {
        require(ERC20(USDC_contract_address).balanceOf(_msgSender()) >= amount, "You don't own enough USDC to exchange");
        ERC20(USDC_contract_address).transferFrom(_msgSender(), address(this), amount);
        _mint(_msgSender(), amount);
    }


    function Amount_in_contract() public view returns (uint256, uint256){
        uint256 USDC_available_funds = ERC20(USDC_contract_address).balanceOf(address(this));
        uint256 USDC_available_funds_MarketPlace = BH_MarketPlace(BHMarketplace_contract_address).available_funds();
        return (USDC_available_funds, USDC_available_funds_MarketPlace);
    }

}
