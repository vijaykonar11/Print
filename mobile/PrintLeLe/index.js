import { AppRegistry } from 'react-native';

import App from './App';

AppRegistry.registerComponent('PrintLeLe', () => App);

String.prototype.trunc = String.prototype.trunc ||
  function(n){
    return (this.length > n) ? this.substr(0, n-1) + '...' : this;
  };