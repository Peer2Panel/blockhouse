import React, { useEffect, useState} from 'react';
import i18n from 'meteor/universe:i18n';

const T = ({children}, ...args) => {
  console.log(children)
  const setLocale = useState(i18n.getLocale())[1];
  useEffect(() => {
    i18n.onChangeLocale(setLocale);
    return () => {
      i18n.offChangeLocale(setLocale);
    };
  }, [setLocale]);
  const translation = i18n.getTranslation(children, ...args);
  console.log(translation);
  return translation;
}

export default T;