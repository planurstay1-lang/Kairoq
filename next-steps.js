'use strict';
// Next-step suggestions for the editor, like Lovable's row above the prompt: read from the
// app's own source and settings, no model call and no credit. Each is a prompt to fill in,
// or a dialog to open (publish, checks).

function sourceText(files){
 return Object.entries(files||{}).filter(([n])=>/^src\//.test(n)&&!/^src\/components\/ui\//.test(n)&&!/\.json$/.test(n)).map(([,c])=>String(c||'')).join('\n');
}
function backendOf(files){try{return JSON.parse(files['src/backend.json']||'{}')||{}}catch{return{}}}

function suggest(meta,files){
 const src=sourceText(files),be=backendOf(files),out=[];
 const has=re=>re.test(src);
 const collections=Object.keys(be.collections||{});
 const checks=Array.isArray(meta.checks)?meta.checks.length:0;
 const built=Boolean(meta.current_version);
 const add=(label,x)=>{if(out.length<5&&!out.some(o=>o.label===label))out.push({label,...x})};
 if(!built)return out;
 // The thing most owners want next, in the order they tend to want it.
 if(!meta.published)add('Publish it',{open:'publish'});
 else if(!(meta.domains||[]).length)add('Connect your domain',{open:'publish'});
 if(!has(/<form\b|onSubmit/))add('Add a contact form that saves enquiries',{prompt:'Add a contact form (name, email, message) that saves each enquiry and shows a thank-you message.'});
 if(collections.length&&!be.auth&&!be.signIn)add('Add sign-in for staff',{prompt:'Add staff sign-in so only signed-in staff can see and manage the saved records.'});
 if(collections.length&&!be.email)add('Email me each new request',{prompt:'Email the owner whenever a new record is saved, with the details in the message.'});
 if(has(/<form\b|onSubmit/)&&!checks)add('Save a check for the main flow',{open:'checks'});
 if(!has(/<img\b|unsplash\.com|\.(jpe?g|png|webp)\b/i))add('Add real photos',{prompt:'Add real photos to the main sections (hero and key cards) using fitting Unsplash images, with alt text.'});
 if(!has(/faq|frequently asked/i))add('Add an FAQ section',{prompt:'Add an FAQ section with the 6 questions customers ask most, with clear answers.'});
 if(!has(/testimonial|review/i))add('Add customer reviews',{prompt:'Add a reviews section with three short customer quotes, names and a star rating, clearly marked as examples until real ones are added.'});
 if(!has(/pric(e|ing)|rate|\$\d|€\d|£\d/i))add('Add prices',{prompt:'Add a clear pricing or rates section with sample values marked as examples.'});
 if(!has(/\b(sm|md|lg):|@media/))add('Make it work on phones',{prompt:'Make every page work well on a phone: stacked layout, readable text, a menu that collapses.'});
 add('Improve the design',{prompt:'Polish the design: consistent spacing and type, one accent colour, better hero, hover and focus states.'});
 return out.slice(0,5);
}

module.exports={suggest};
