import { Meteor } from 'meteor/meteor';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import "./methods";

dotenv.config()

Meteor.startup(() => {
});
