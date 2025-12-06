// Test file to verify exports
import * as ProductService from './service/product';

console.log('ProductService exports:', Object.keys(ProductService));
console.log('addFavoriteProduct:', typeof ProductService.addFavoriteProduct);
console.log('removeFavoriteProduct:', typeof ProductService.removeFavoriteProduct);
console.log('checkFavoriteProduct:', typeof ProductService.checkFavoriteProduct);
console.log('getFavoriteProducts:', typeof ProductService.getFavoriteProducts);

export { };

