import React, { Suspense } from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { Routes } from "../app/ui/common/Routes";

import '../app/ui/common/de.i18n.json';
import '../app/ui/common/en.i18n.json';
import i18n from 'meteor/universe:i18n';
import Cookies from 'js-cookie'

Meteor.startup(() => {
  render(
    <Suspense fallback={() => <h1>Loading...</h1>}>
      <Routes />
    </Suspense>,
    document.getElementById('react-target')
  );
});

// use the browser's locale
// give preference to language cookies
// J: be careful about en-GB and en-US etc.
function getLang () {
  return (
  Cookies.get('language') || 
      navigator.languages && navigator.languages[0] ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      'en-US'
  );
}
const lang = getLang();
console.log(lang)
i18n.setLocale(lang.split("-")[0]);
