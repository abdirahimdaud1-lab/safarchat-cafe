/* Menu data: categories, sub-categories and every product with price, description and art. Edit prices and items here. */
'use strict';

const SUBS = {
  drinks:[['hotcoffee','Hot Coffee'],['icedcoffee','Iced Coffee'],['hottea','Hot Tea'],['icedtea','Iced Tea'],['matcha','Matcha'],['refreshers','Refreshers'],['frappes','Frappés'],['smoothies','Smoothies'],['bottled','Bottled Drinks']],
  food:[['pastry','Pastry'],['cakes','Cakes'],['sandwiches','Sandwiches']]
};
const SUBNAME = Object.fromEntries([...SUBS.drinks, ...SUBS.food]);
const DRINK_SUBS = SUBS.drinks.map(s => s[0]);
/* Products come from the server (get_menu) so prices and "sold out" are always current.
   The starting menu lives in supabase/schema.sql; admins change prices in staff.html. */
const PRODUCTS = [];
const PBY = {};
const FEATURED = ['ic4','mt3','fr5','hc6','ht1','pa3','hc1','ck5'];
