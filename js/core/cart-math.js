/* Cart totals: subtotal, Stars discount (100★ = $8), 5% tax. */
'use strict';

const cartCount = () => S.cart.reduce((a, c) => a + c.qty, 0);
const cartSub = () => S.cart.reduce((a, c) => a + c.unit * c.qty, 0);
function maxStarsUsable(){
  const sub = cartSub();
  const byBal = Math.floor(S.stars / 100) * 100;
  const byCart = Math.floor(sub / (100 * STAR_USD)) * 100;
  return Math.max(0, Math.min(byBal, byCart));
}
function totals(extraFee = 0){
  const sub = cartSub();
  const used = Math.min(S.useStars, maxStarsUsable());
  const disc = used * STAR_USD;
  const taxable = Math.max(0, sub - disc);
  const tax = Math.round(taxable * TAX * 100) / 100;
  const total = Math.round((taxable + tax + extraFee) * 100) / 100;
  return { sub, used, disc, tax, fee:extraFee, total };
}
const nextTier = () => [100,200,300,500,1000].find(t => t > S.stars) || 1000;
