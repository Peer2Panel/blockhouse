import React from 'react';
import Cookies from 'js-cookie';
import Select from 'react-select';
import Flag from 'react-world-flags'
import i18n from 'meteor/universe:i18n';

const EnglishFlag = <span style={{color: "black"}}><Flag style={{height: "20px", display: "inline-block"}} code={ "GB" } height="16" /></span>
const GermanFlag = <span style={{color: "black"}}><Flag style={{height: "20px", display: "inline-block"}} code={ "CH" } height="16" /></span>
const options = [
    { value: 'en', label: EnglishFlag },
    { value: 'de', label: GermanFlag },
  ];

class LanguageSelector extends React.Component{ 

    constructor(props) {
        super(props);
        this.changeLanguage = this.changeLanguage.bind(this);
        const locale = i18n.getLocale();
        this.state = { selectedOption: options.find(option => option.value == locale) }       
    }

    changeLanguage(valuepluslabel){
        const target_language = valuepluslabel.value;
        console.log(target_language)
        Cookies.set('language', target_language, { expires: 30 })
        i18n.setLocale(target_language);
        console.log(target_language);
        this.setState({ selectedOption: valuepluslabel });
    }

    render(){         
        return(
            <div>
                <div style={
                    {
                    width: "88px", 
                    margin: "10px",
                    position: "relative"
                    }
                }>
                    <Select
                        value={this.state.selectedOption}
                        onChange={this.changeLanguage}
                        options={options}
                        isSearchable={false}
                    />
                </div>
            </div>
        )
    }
}

export default LanguageSelector;