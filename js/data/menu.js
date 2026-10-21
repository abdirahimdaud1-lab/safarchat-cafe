/* Menu data: categories, sub-categories and every product with price, description and art. Edit prices and items here. */
'use strict';

const SUBS = {
  drinks:[['hotcoffee','Hot Coffee'],['icedcoffee','Iced Coffee'],['hottea','Hot Tea'],['icedtea','Iced Tea'],['matcha','Matcha'],['refreshers','Refreshers'],['frappes','Frappés'],['smoothies','Smoothies'],['bottled','Bottled Drinks']],
  food:[['pastry','Pastry'],['cakes','Cakes'],['sandwiches','Sandwiches']]
};
const SUBNAME = Object.fromEntries([...SUBS.drinks, ...SUBS.food]);
const DRINK_SUBS = SUBS.drinks.map(s => s[0]);
const PRODUCTS = [];
const P = (id, sub, name, price, desc, art, o = {}) => PRODUCTS.push(Object.assign({ id, sub, name, price, desc, art }, o));

P('hc1','hotcoffee','Qaxwo · Cardamom Coffee',1.50,'Somali coffee brewed with crushed cardamom and a hint of ginger, the way Mogadishu drinks it.','hot:brown',{sig:1,kcal:15});
P('hc2','hotcoffee','Espresso',2.00,'A double shot pulled short, dark and syrupy.','hot:brown',{kcal:10});
P('hc3','hotcoffee','Americano',2.25,'Espresso lengthened with hot water for a clean, bold cup.','hot:green',{kcal:15});
P('hc4','hotcoffee','Cappuccino',3.00,'Espresso, steamed milk and a deep, velvety layer of foam.','hot:green',{m:1,kcal:120});
P('hc5','hotcoffee','Caffè Latte',3.25,'Smooth espresso with plenty of silky steamed milk.','hot:milk',{m:1,kcal:190});
P('hc6','hotcoffee','Camel Milk Latte',3.75,'Our signature latte made with fresh, lightly sweet camel milk.','hot:milk',{m:1,sig:1,kcal:170});
P('hc7','hotcoffee','Flat White',3.25,'Ristretto shots under a thin layer of micro-foam.','hot:green',{m:1,kcal:110});
P('hc8','hotcoffee','Caramel Macchiato',3.75,'Vanilla, steamed milk, espresso and a caramel crosshatch.','hot:gold',{m:1,kcal:240});
P('hc9','hotcoffee','Spiced Mocha',3.50,'Dark chocolate, espresso and a pinch of cinnamon.','hot:clay',{m:1,kcal:260});

P('ic1','icedcoffee','Iced Americano',2.50,'Espresso over ice and cold water.','iced:#3A2318:#5A3624',{kcal:15});
P('ic2','icedcoffee','Iced Latte',3.50,'Espresso and cold milk poured over ice.','iced:#6B4126:#EFE4CF',{m:1,kcal:130});
P('ic3','icedcoffee','Iced Spanish Latte',3.75,'Sweetened condensed milk, espresso and ice.','iced:#7A4A2B:#F2E2C4',{m:1,kcal:210});
P('ic4','icedcoffee','Saffron Iced Latte',4.00,'Golden saffron syrup, cold milk and a double shot. New this season.','iced:#C7922F:#F4DFB0',{m:1,n:1,kcal:190});
P('ic5','icedcoffee','Cold Brew',3.25,'Steeped for 18 hours for a smooth, low-acid finish.','iced:#2E1A10:#4A2C1C',{kcal:5});
P('ic6','icedcoffee','Iced Caramel Macchiato',4.00,'Vanilla milk, ice, espresso and caramel drizzle.','iced:#8A5A2E:#F3E7D2',{m:1,kcal:250});

P('ht1','hottea','Shaah Cadays',1.50,'Spiced milk tea: cardamom, clove and cinnamon simmered with fresh milk.','hot:sand',{m:1,sig:1,kcal:140});
P('ht2','hottea','Shaah Bigays',1.00,'Black spiced tea, bright and fragrant.','hot:sand',{kcal:5});
P('ht3','hottea','Camel Milk Chai',2.50,'Our spiced chai slow-cooked in camel milk.','hot:milk',{m:1,sig:1,kcal:160});
P('ht4','hottea','Ginger Lemon Tea',1.75,'Fresh ginger, lemon and a spoon of honey.','hot:clay',{kcal:40});
P('ht5','hottea','Fresh Mint Tea',1.50,'Green tea with a handful of fresh mint.','hot:green',{kcal:5});
P('ht6','hottea','Earl Grey',1.75,'Black tea scented with bergamot.','hot:sand',{m:1,kcal:5});

P('it1','icedtea','Iced Shaah Cadays',2.00,'Our spiced milk tea, chilled and poured over ice.','iced:#A8743F:#D9B98A',{m:1,kcal:150});
P('it2','icedtea','Iced Lemon Tea',2.00,'Black tea shaken with lemon and ice.','iced:#B9832A:#E2B85C',{kcal:80});
P('it3','icedtea','Peach Iced Tea',2.25,'Black tea with ripe peach.','iced:#D9823B:#F2B071',{kcal:90});
P('it4','icedtea','Hibiscus Iced Tea',2.25,'Tart hibiscus, a little sugar, lots of ice.','iced:#8E1F3A:#C4405C',{kcal:70});
P('it5','icedtea','Iced Mint Tea',2.00,'Green tea and fresh mint over ice.','iced:#6F8F3A:#A9C46A',{kcal:60});

P('mt1','matcha','Matcha Latte',3.75,'Ceremonial-grade matcha whisked into steamed milk.','hot:green',{m:1,kcal:180});
P('mt2','matcha','Iced Matcha Latte',4.00,'Matcha and cold milk over ice.','iced:#6E9A3C:#EEF0DC',{m:1,kcal:170});
P('mt3','matcha','Camel Milk Matcha',4.25,'Grassy matcha layered over cold camel milk. Our newest signature.','iced:#5F8F35:#F5F0E6',{m:1,n:1,sig:1,kcal:160});
P('mt4','matcha','Strawberry Matcha',4.50,'Strawberry purée, milk and a matcha float.','iced:#D9586A:#7AA648',{m:1,kcal:220});
P('mt5','matcha','Coconut Matcha',4.25,'Matcha shaken with coconut milk.','iced:#79A447:#FFFFFF',{m:1,kcal:190});

P('rf1','refreshers','Mango Passion Refresher',3.25,'Mango and passion fruit shaken with ice.','iced:#F0A020:#F7C948',{kcal:90});
P('rf2','refreshers','Strawberry Açaí',3.25,'Strawberry and açaí with real fruit pieces.','iced:#C8344F:#E8687C',{kcal:100});
P('rf3','refreshers','Lime Mint Mojito',3.00,'Lime, mint and sparkling water. Alcohol-free.','iced:#8CBF4A:#C9E59A',{kcal:80});
P('rf4','refreshers','Pineapple Ginger',3.25,'Pineapple juice with a fresh ginger kick.','iced:#E6B93A:#F3D872',{kcal:95});
P('rf5','refreshers','Hibiscus Berry',3.25,'Hibiscus and mixed berries.','iced:#9B2240:#D0506D',{kcal:90});

P('fr1','frappes','Caramel Frappé',4.00,'Blended coffee, caramel, whipped cream.','frappe:#C49A6C:#B5741F',{m:1,kcal:380});
P('fr2','frappes','Mocha Frappé',4.00,'Coffee and chocolate blended with ice.','frappe:#6B4126:#3A2318',{m:1,kcal:370});
P('fr3','frappes','Java Chip Frappé',4.25,'Mocha frappé with chocolate chips.','frappe:#5A3624:#2B170E',{m:1,kcal:420});
P('fr4','frappes','Vanilla Cream Frappé',3.75,'Coffee-free vanilla cream, blended.','frappe:#EFE3C8:#E2C48A',{m:1,kcal:330});
P('fr5','frappes','Cardamom Date Frappé',4.50,'Medjool dates, cardamom and espresso blended with ice.','frappe:#A87447:#6A3B1C',{m:1,sig:1,n:1,kcal:360});

P('sm1','smoothies','Mango Banana',3.50,'Mango, banana and yoghurt.','smoothie:#F2A93B:#F7D046',{kcal:240});
P('sm2','smoothies','Strawberry Banana',3.50,'Strawberry, banana and yoghurt.','smoothie:#E2566D:#F7D046',{kcal:230});
P('sm3','smoothies','Papaya Lime',3.25,'Somali papaya with fresh lime.','smoothie:#F08A4B:#8CBF4A',{kcal:180});
P('sm4','smoothies','Avocado Date',3.75,'Avocado, dates and milk.','smoothie:#A3B85A:#6A3B1C',{kcal:320});
P('sm5','smoothies','Mixed Berry',3.75,'Blueberry, raspberry and strawberry.','smoothie:#7B2D5B:#C8344F',{kcal:210});
P('sm6','smoothies','Guava Breeze',3.25,'Pink guava, lime and mint.','smoothie:#EF7F8F:#9CC45A',{kcal:190});

P('bt1','bottled','Water 300ml',0.50,'Still drinking water.','bottle:w300',{kcal:0});
P('bt2','bottled','Dasani Water',0.75,'Purified still water, 500ml.','bottle:dasani',{kcal:0});
P('bt3','bottled','Water 350ml',0.60,'Still drinking water.','bottle:w350',{kcal:0});
P('bt4','bottled','Sprite',1.00,'Lemon-lime soda, 330ml.','bottle:sprite',{kcal:140});
P('bt5','bottled','Coca-Cola',1.00,'Classic cola, 330ml can.','can:cola',{kcal:139});
P('bt6','bottled','Fanta Orange',1.00,'Orange soda, 330ml.','bottle:fanta',{kcal:150});
P('bt7','bottled','Sparkling Water',1.25,'Lightly carbonated mineral water.','bottle:spark',{kcal:0});
P('bt8','bottled','Fresh Orange Juice',2.50,'Pressed this morning, 330ml.','bottle:oj',{kcal:150});

P('pa1','pastry','Butter Croissant',1.75,'Flaky, golden, all-butter.','food:croissant',{kcal:270});
P('pa2','pastry','Chocolate Croissant',2.25,'Two batons of dark chocolate in laminated dough.','food:painchoc',{kcal:320});
P('pa3','pastry','Malawax with Honey',2.00,'Somali crêpes, stacked warm and finished with honey.','food:malawax',{sig:1,kcal:310});
P('pa4','pastry','Sambuusa (3)',1.50,'Crisp triangles filled with spiced beef and onion.','food:sambuusa',{kcal:280});
P('pa5','pastry','Kac Kac',1.00,'Sweet fried dough bites dusted with sugar.','food:kackac',{kcal:220});
P('pa6','pastry','Cinnamon Roll',2.50,'Soft roll, cinnamon swirl, cream icing.','food:roll',{kcal:390});
P('pa7','pastry','Date Muffin',2.25,'Moist muffin studded with chopped dates.','food:muffin',{kcal:340});
P('pa8','pastry','Xalwo',1.50,'Traditional Somali halwa with cardamom and nutmeg.','food:xalwo',{kcal:200});
P('pa9','pastry','Cardamom Bun',2.00,'Knotted bun with cardamom sugar.','food:bun',{kcal:290});

P('ck1','cakes','Chocolate Fudge Cake',3.50,'Three layers of dark chocolate sponge and fudge.','cake:#4A2616:#6B3A22:#2E170C',{kcal:450});
P('ck2','cakes','Red Velvet',3.75,'Cocoa sponge with cream cheese frosting.','cake:#A3263A:#F5EFE6:#F5EFE6',{kcal:420});
P('ck3','cakes','Carrot Cake',3.50,'Spiced carrot sponge, walnuts, cream cheese.','cake:#C98A4A:#F3EAD8:#F3EAD8',{kcal:410});
P('ck4','cakes','New York Cheesecake',4.00,'Baked vanilla cheesecake with berry glaze.','cake:#F3E2BF:#F3E2BF:#C8344F',{kcal:430});
P('ck5','cakes','Date & Cardamom Cake',3.25,'Sticky date sponge with cardamom cream.','cake:#8A5A2E:#E9D7B5:#6A3B1C',{sig:1,kcal:380});
P('ck6','cakes','Tiramisu',4.25,'Espresso-soaked sponge and mascarpone.','cake:#E9DCC4:#5A3624:#5A3624',{kcal:400});
P('ck7','cakes','Basbousa',2.50,'Semolina cake soaked in light syrup.','cake:#D9A556:#D9A556:#B8862F',{kcal:330});

P('sw1','sandwiches','Chicken Suqaar Wrap',4.50,'Sautéed spiced chicken, peppers and greens in a soft wrap.','food:wrap',{kcal:520});
P('sw2','sandwiches','Club Sandwich',5.00,'Chicken, egg, cheese, tomato and lettuce on toast.','food:sand',{kcal:610});
P('sw3','sandwiches','Halloumi & Tomato',4.25,'Grilled halloumi, tomato and herbs.','food:sand2',{kcal:480});
P('sw4','sandwiches','Tuna Melt',4.50,'Tuna, melted cheese and pickles.','food:sand3',{kcal:540});
P('sw5','sandwiches','Egg & Cheese Croissant',3.75,'Soft egg and cheddar in a butter croissant.','food:eggcroissant',{kcal:430});
P('sw6','sandwiches','Beef Sabaayad Roll',4.75,'Spiced beef rolled in flaky sabaayad flatbread.','food:wrap2',{kcal:580});

const PBY = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
const FEATURED = ['ic4','mt3','fr5','hc6','ht1','pa3','hc1','ck5'];
