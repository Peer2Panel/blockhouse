import React from "react";
import { useNavigate } from "react-router-dom";
import { RoutePaths } from "../common/RoutePaths";
import T from "../Translator.jsx";
import i18n from 'meteor/universe:i18n';

import {
  marketplaceAddress
} from '../../../config'

export const Card = ({
  children,
  groupedByHouse = false,
  num_tokens = 0,
  min_price = 0,
  max_price = 0,
  setSelectedHouse = () => {},
  className = '',
  itemImg = null,
  itemName = null,
  itemPrice = null,
  itemId = null,
  badge = '',
  loggedInAddress = '',
  nft = null,
  serialNumber = 'N/A',
  monthlyRevenue = '',
  itemCountry = 'Other',
  remaining_payments = 240
}) => {
  const badgeBackgroundColor = (badge === "owned") ? "bg-burst" : (badge === "for sale") ? "bg-dodger" : "bg-rhino";
  return (
    <div className={`cursor-pointer ${className}`} onClick={() => num_tokens == 0 ? window.open(`${RoutePaths.DETAILS}/${itemId}`, target="_blank") : setSelectedHouse(itemName)}>
      <div className="relative rounded-t-lg max-h-80 flex items-center overflow-hidden">
        {badge && (
          <p className={`absolute top-0 left-0 text-small text-white font-medium uppercase rounded-br-lg py-1 px-2 ${badgeBackgroundColor}`}>{i18n.getTranslation(`Common.${badge}`)}</p>
        )}
        <img 
        style={{
          objectFit: "cover",
          height: "200px",
          background: "white"
        }}
        className="w-full" src={itemImg.replace("ipfs.infura.io", "blockhouse.infura-ipfs.io")} />
      </div>
      <div className="rounded-b-xl bg-white p-4" style={{"padding": "30px"}}>
        <div className="flex justify-between items-start">
          <p className="text-p text-rhino">{itemName} (<T>Common.Switzerland</T>) [#{itemId}]</p>
        </div>
        {groupedByHouse ? 
          <div>
            <div className="flex justify-between items-start">
              <p className="text-p text-rhino"><b><T>Common.total_price</T>:</b> CHF 1'095'000.–</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="text-p text-rhino"><b><T>Common.availability</T>:</b>{num_tokens > 1 ? <span> {num_tokens} / 500 <T>Common.tokens</T></span> : <span> 1 <T>Common.token</T></span>}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="text-p text-rhino"><b>{(badge === "owned" || badge === "staked") ? <T>Common.book_value</T> : <T>Common.token_price</T>}:</b>{num_tokens > 1 ? <span> ${min_price} - ${max_price}</span> : <span> ${max_price}</span>}</p>
            </div>
          </div>
        :
          <div>
            <div className="flex justify-between items-start">
              <p className="text-p text-rhino"><b><T>Common.total_price</T>:</b> CHF 1'095'000.–</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="text-p text-rhino"><b>{(badge === "owned" || badge === "staked") ? <T>Common.book_value</T> : <T>Common.token_price</T>}:</b> {itemPrice} USDC</p>
            </div>
          </div>
        }
        <div className="flex justify-between items-start">
          <p className="text-p text-rhino"><b><T>Common.rent_per_token</T>: </b> CHF 7.8 {/*monthlyRevenue*/} / <T>Common.month</T></p>
        </div>
        <div className="flex justify-between items-start">
          <p className="text-p text-rhino"><b><T>Common.rent_start_date</T>: </b> 01.05.2023</p>
        </div>
        <div className="flex justify-between items-start">
          <p className="text-p text-rhino"><b><T>Common.est_irr</T>: </b> <span style={{fontSize: "20px"}}> 7.11%</span></p>
        </div>
      </div>
    </div>
  );
}
