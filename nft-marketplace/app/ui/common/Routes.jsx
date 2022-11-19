import React from 'react';
import { BrowserRouter, Routes as ReactRoutes, Route } from 'react-router-dom';
import { RoutePaths } from './RoutePaths';
import { App } from "../App";

const HomePage = React.lazy(() => import('../HomePage'));
const ContractTestPage = React.lazy(() => import('../ContractTestPage'));
const MintNFTPage = React.lazy(() => import('../MintNFTPage'));
const ConnectPage = React.lazy(() => import('../ConnectPage'));
const DetailsPage = React.lazy(() => import('../DetailsPage'));
const AccountPage = React.lazy(() => import('../AccountPage'));

export const Routes = () => (
  <BrowserRouter>
    <ReactRoutes>
      <Route path={RoutePaths.ROOT} element={<App />}>
        <Route index element={<HomePage />} key={"home"} />
        <Route path={RoutePaths.CONTRACT_TEST} element={<ContractTestPage />} key={RoutePaths.CONTRACT_TEST} />
        <Route path={RoutePaths.MINT_NFT} element={<MintNFTPage />} key={RoutePaths.MINT_NFT} />
        <Route path={RoutePaths.CONNECT} element={<ConnectPage />} key={RoutePaths.CONNECT} />
        <Route path={`${RoutePaths.DETAILS}/:itemId`} element={<DetailsPage />} key={`${RoutePaths.DETAILS}/:itemId`} />
        <Route path={`${RoutePaths.ACCOUNT}/:address`} element={<AccountPage />} key={`${RoutePaths.ACCOUNT}/:address`} />
      </Route>
    </ReactRoutes>
  </BrowserRouter>
);
