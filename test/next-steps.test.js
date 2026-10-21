'use strict';
// Next-step chips come from the app itself: what it has decides what is suggested.
const test=require('node:test'),assert=require('node:assert/strict');
const {suggest}=require('../next-steps');

const app=(jsx,backend={})=>({'src/App.jsx':jsx,'src/backend.json':JSON.stringify(backend)});

test('an unbuilt project gets nothing; a bare page gets publish, a form, photos and an FAQ',()=>{
 assert.deepEqual(suggest({current_version:0},{}),[]);
 const labels=suggest({current_version:1,published:null,domains:[]},app('<main><h1>Hi</h1></main>')).map(s=>s.label);
 assert.equal(labels[0],'Publish it');
 assert.ok(labels.includes('Add a contact form that saves enquiries'));
 assert.ok(labels.includes('Add real photos'));
 assert.equal(labels.length,5);
});

test('what the app already has is not suggested; saved records invite sign-in, email and a check',()=>{
 const files=app('<form onSubmit={save}><img src="https://images.unsplash.com/x.jpg"/>FAQ reviews $120 <div className="md:flex"/></form>',{collections:{bookings:{}}});
 const out=suggest({current_version:2,published:{url:'x'},domains:[],checks:[]},files);
 const labels=out.map(s=>s.label);
 assert.equal(labels[0],'Connect your domain');
 assert.ok(labels.includes('Add sign-in for staff'));
 assert.ok(labels.includes('Email me each new request'));
 assert.ok(labels.includes('Save a check for the main flow'));
 for(const gone of ['Add a contact form that saves enquiries','Add real photos','Add an FAQ section','Add customer reviews','Add prices','Make it work on phones'])assert.ok(!labels.includes(gone),gone);
 assert.equal(out.find(s=>s.label==='Save a check for the main flow').open,'checks');
 assert.ok(out.find(s=>s.label==='Add sign-in for staff').prompt.length>20);
});

test('never more than five, and a published app with a domain and everything else skips to design',()=>{
 const files=app('<form onSubmit={f}/><img src="a.png"/> FAQ testimonial price <div className="sm:p-2"/>',{collections:{a:{}},auth:{},email:{}});
 const labels=suggest({current_version:3,published:{url:'x'},domains:['example.com'],checks:[{name:'x'}]},files).map(s=>s.label);
 assert.deepEqual(labels,['Improve the design']);
});
