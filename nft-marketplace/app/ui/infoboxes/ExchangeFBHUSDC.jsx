import React, { useEffect, useState } from 'react';
import MaterialButton from '@mui/material/Button';
import { Button } from "../components/Button";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Amount_in_contract, exchange_FBH_TO_USDC, approve_USDC, exchange_USDC_TO_FBH } from "../contract_functions/BH_FungibleSolar";
import { useOutletContext } from "react-router-dom";

export default function ExchangeFBHUSDC(children) {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = useState(0);
  const [amountInContract, setAmountInContract] = useState(0);
  const [web3, connected, setConnection, onConnect, resetApp, loggedInAddress] = useOutletContext();

  useEffect(() => {
    Amount_in_contract(loggedInAddress, setAmountInContract);
  }, []);


  onChange = (e) => {
    const new_value = e.target.value;
    console.log(new_value)  
    setAmount(new_value);
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <span>
      <span onClick={handleClickOpen}>
        (exchange 1:1 with PSM)
      </span>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Price Stability Mechanism"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Here you can exchange Fungible Blockhouse FBH and USDC, as long as there are reserves in the smart contract. You need to approve the amount of USDC first.
            <div style={{maxWidth: "48rem"}} className=" mx-auto mt-14 mb-2.5 px-2 sm:px-0 ">
              <div style={{padding: "20px"}}>
                <label htmlFor="file" className="flex relative">
                  <input
                    type="text"
                    name="Amount"
                    placeholder="Amount in contract"
                    className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
                    id="balance"
                    disabled
                    value={`Amount in contract: ${amountInContract}`}
                  />
                    <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Check balance" onClick={() => Amount_in_contract(loggedInAddress, setAmountInContract)} />
                </label>
                <label htmlFor="file" className="flex relative">
                  <input
                    onChange={onChange}
                    type="text"
                    name="Amount"
                    placeholder="Amount"
                    className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
                    id="amount"
                    value={amount}
                  />
                    <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Approve USDC" onClick={() => approve_USDC(loggedInAddress, amount)} />
                </label>
                <label htmlFor="file" className="flex relative">
                  <input
                    onChange={onChange}
                    type="text"
                    name="Amount"
                    placeholder="Amount"
                    className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
                    id="amount"
                    value={amount}
                  />
                    <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Change USDC to FBH 1:1 - tbd" onClick={() => exchange_USDC_TO_FBH(loggedInAddress, amount)} />
                </label>
                <label htmlFor="file" className="flex relative">
                  <input
                    onChange={onChange}
                    type="text"
                    name="Amount"
                    placeholder="Amount"
                    className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
                    id="amount"
                    value={amount}
                  />
                    <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Change FBH to USDC 1:1 - tbd" onClick={() => exchange_FBH_TO_USDC(loggedInAddress, amount)} />
                </label>
              </div>
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MaterialButton onClick={handleClose}>Close</MaterialButton>
        </DialogActions>
      </Dialog>
    </span>
  );
}
