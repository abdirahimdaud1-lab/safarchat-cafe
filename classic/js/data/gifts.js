/* Gift occasions, sub-categories and bundles/boxes with prices. */
'use strict';

const GCATS = [
  { k:'birthday', name:'Birthday', ic:'cake', bg:'linear-gradient(140deg,#B8862F,#8A6216)', msg:'Happy Birthday!', from:3.00 },
  { k:'thanks', name:'Thank You', ic:'thanks', bg:'linear-gradient(140deg,#1E5E3A,#0C361F)', msg:'Thank you!', from:3.00 },
  { k:'congrats', name:'Congratulations', ic:'trophy', bg:'linear-gradient(140deg,#9A4A2C,#6B2F1A)', msg:'Hambalyo! Congratulations', from:5.00 },
  { k:'bye', name:'Bye Bye', ic:'wave', bg:'linear-gradient(140deg,#5C3D2C,#3A2318)', msg:'Safe journey, friend', from:5.00 },
  { k:'eid', name:'Eid Mubarak', ic:'moon', bg:'linear-gradient(140deg,#14482A,#B8862F)', msg:'Ciid Mubaarak', from:5.00 },
  { k:'just', name:'Just Because', ic:'smile', bg:'linear-gradient(140deg,#C49A6C,#9A4A2C)', msg:'Thinking of you', from:3.00 }
];
const GSUBS = [['cards','eGift Cards'],['bundles','Treat Bundles'],['boxes','Gift Boxes']];
const GITEMS = {
  birthday:{ bundles:[['Birthday Slice & Latte','Any cake slice + a Medium latte',6.75],['Celebration for Two','2 drinks + 2 cake slices',12.50],['Whole Birthday Cake','Any whole cake, 8 slices, with a candle',24.50]], boxes:[['Sweet Birthday Box','6 cake slices + 6 Kac Kac',18.00],['Coffee Lover Box','Qaxwo beans 250g + SafarChat mug',16.00]] },
  thanks:{ bundles:[['Shaah & Sambuusa','Shaah Cadays + Sambuusa (3)',3.00],['Thank-You Coffee Break','Any coffee + any pastry',5.50],['Team Thank You (5)','5 drinks for the whole team',15.00]], boxes:[['Shaah Spice Tin','Our cardamom, clove & cinnamon blend',9.00],['Xalwo Box','500g traditional Somali xalwo',8.00]] },
  congrats:{ bundles:[['Frappé Party (4)','4 frappés of their choice',15.50],['Celebration Cake Box','Whole cake + 4 drinks',36.00]], boxes:[['Golden Gift Box','Saffron syrup, beans & mug',22.00],['Premium Dates & Coffee','Medjool dates + Qaxwo beans',19.00]] },
  bye:{ bundles:[['Farewell Coffee Round','6 drinks to send them off',16.00],['One Last Malawax','Malawax with Honey + Shaah',3.25]], boxes:[['Safe Journey Box','Travel mug, Qaxwo beans & xalwo',21.00],['Take-Home Shaah Kit','Spice tin + 2 glasses',14.00]] },
  eid:{ bundles:[['Eid Breakfast for Four','4 drinks + 4 pastries',14.00],['Eid Sweet Table','Xalwo, Basbousa & Kac Kac platter',12.00]], boxes:[['Eid Hamper','Dates, xalwo, Qaxwo beans & mug',28.00],['Shaah Spice Tin','Our signature tea spices',9.00]] },
  just:{ bundles:[['Coffee on Me','Any drink, any size',4.50],['Little Treat','A pastry and a Shaah Cadays',3.25]], boxes:[['Mini Bean Bag','Qaxwo beans 125g',7.00]] }
};
