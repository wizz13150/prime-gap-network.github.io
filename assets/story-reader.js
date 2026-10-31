/* Source-first illustrated reader foundation. No book or story is bundled. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.PgnStoryReader=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const idPattern=/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/;
  const requireValue=(ok,message)=>{if(!ok)throw new Error(message);};
  const text=value=>typeof value==='string'&&value.trim().length>0;
  function validateBook(input){
    requireValue(input&&input.version===1,'Unsupported reader manifest version.');
    requireValue(text(input.title)&&text(input.author),'A title and original author are required.');
    const source=input.source;
    requireValue(source&&['operator-supplied-text','operator-supplied-attachment'].includes(source.kind),'A supplied source is required; a URL alone is not an input book.');
    requireValue(source.reviewed===true&&/^[a-f0-9]{64}$/i.test(source.sha256||''),'The supplied source needs a reviewed SHA-256 receipt.');
    requireValue(Object.keys(source).every(k=>['kind','reviewed','sha256'].includes(k)),'Do not publish source paths, URLs or personal intake metadata.');
    requireValue(Array.isArray(input.blocks)&&input.blocks.length>0,'Canonical source blocks are required.');
    requireValue(Array.isArray(input.scenes)&&input.scenes.length>0,'At least one scene is required.');
    const blocks=new Map(),sceneIds=new Set();
    input.blocks.forEach(block=>{
      requireValue(block&&idPattern.test(block.id||'')&&!blocks.has(block.id),'Source-block IDs must be valid and unique.');
      requireValue(['paragraph','heading'].includes(block.kind)&&text(block.text)&&text(block.sourceRef),'Each exact source block needs its kind, text and source location.');
      blocks.set(block.id,block);
    });
    const firstSeen=new Set();let nextSource=0;
    input.scenes.forEach(scene=>{
      requireValue(scene&&idPattern.test(scene.id||'')&&!sceneIds.has(scene.id)&&text(scene.title),'Scene IDs must be unique and scenes need titles.');
      sceneIds.add(scene.id);
      requireValue(Array.isArray(scene.blockIds)&&scene.blockIds.length>0&&new Set(scene.blockIds).size===scene.blockIds.length,'A scene needs distinct references to canonical blocks.');
      scene.blockIds.forEach(id=>{
        requireValue(blocks.has(id),'A scene refers to a missing source block.');
        if(!firstSeen.has(id)){
          requireValue(input.blocks[nextSource]?.id===id,'First appearances must preserve the canonical source order.');
          firstSeen.add(id);nextSource++;
        }
      });
      const visual=scene.visual;
      requireValue(visual&&text(visual.alt),'Every scene needs a meaningful visual description.');
      if(visual.kind==='image')requireValue(/^assets\/story\/[A-Za-z0-9_./-]+\.(png|jpe?g|webp|svg)$/i.test(visual.src||'')&&!visual.src.split('/').includes('..'),'Images must be reviewed local story assets, never a PDF or remote embed.');
      else requireValue(visual.kind==='renderer'&&idPattern.test(visual.rendererId||''),'A scene needs an image or registered visual renderer.');
    });
    requireValue(nextSource===input.blocks.length,'Canonical source blocks must not be omitted.');
    // JSON snapshots keep source text verbatim and separate it from mutable host data.
    const snapshot=JSON.parse(JSON.stringify(input));
    function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(freeze);}return value;}
    return freeze(snapshot);
  }
  class ReaderModel{
    constructor(book){this.book=validateBook(book);this.index=0;this.blockMap=new Map(this.book.blocks.map(b=>[b.id,b]));}
    get count(){return this.book.scenes.length;}
    get current(){return this.book.scenes[this.index];}
    get currentBlocks(){return this.current.blockIds.map(id=>this.blockMap.get(id));}
    select(index){requireValue(Number.isInteger(index)&&index>=0&&index<this.count,'Scene index is outside the manifest.');this.index=index;return this.current;}
    next(){return this.select(Math.min(this.index+1,this.count-1));}
    previous(){return this.select(Math.max(this.index-1,0));}
  }
  class IllustratedReader{
    constructor(container,book,options={}){
      requireValue(container&&typeof container.replaceChildren==='function','A dedicated reader container is required.');
      this.model=new ReaderModel(book);this.root=container;this.doc=container.ownerDocument;this.renderers=options.renderers||{};this.listeners=[];this.visual=null;this.paused=false;this.destroyed=false;
      this.media=this.doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)');
      this.model.book.scenes.forEach(scene=>{if(scene.visual.kind==='renderer')requireValue(Object.prototype.hasOwnProperty.call(this.renderers,scene.visual.rendererId)&&typeof this.renderers[scene.visual.rendererId]==='function','A declared scene renderer is not registered.');});
      this.root.classList.add('story-reader');
      const header=this.element('header','story-reader-header');
      header.append(this.element('h1','',this.model.book.title),this.element('p','story-reader-author',this.model.book.author));
      const layout=this.element('div','story-reader-layout');
      this.figure=this.element('figure','story-reader-visual');this.figure.setAttribute('role','img');
      this.copy=this.element('article','story-reader-copy');this.heading=this.element('h2','story-reader-heading');this.heading.tabIndex=-1;this.paragraphs=this.element('div','story-reader-text');
      this.copy.append(this.heading,this.paragraphs);layout.append(this.figure,this.copy);
      const controls=this.element('div','story-reader-controls');controls.setAttribute('role','group');controls.setAttribute('aria-label','Reading controls');
      this.previous=this.button('Previous scene',()=>this.select(this.model.index-1,true));this.next=this.button('Next scene',()=>this.select(this.model.index+1,true));
      this.motion=this.button('Pause motion',()=>{this.paused=!this.paused;this.applyMotion();});
      controls.append(this.previous,this.next,this.motion);
      this.status=this.element('p','story-reader-status');this.status.setAttribute('role','status');this.status.setAttribute('aria-atomic','true');
      const contents=this.element('details','story-reader-contents');contents.append(this.element('summary','','Scenes'));
      const navigation=this.element('nav','story-reader-scene-list');navigation.setAttribute('aria-label','Story scenes');
      this.sceneButtons=this.model.book.scenes.map((scene,i)=>{const b=this.button((i+1)+'. '+scene.title,()=>this.select(i,true));navigation.append(b);return b;});contents.append(navigation);
      this.root.replaceChildren(header,layout,controls,this.status,contents);
      this.listen(navigation,'keydown',event=>{
        if(event.altKey||event.ctrlKey||event.metaKey)return;
        const targets={ArrowLeft:Math.max(0,this.model.index-1),ArrowRight:Math.min(this.model.count-1,this.model.index+1),Home:0,End:this.model.count-1};
        if(Object.prototype.hasOwnProperty.call(targets,event.key)){event.preventDefault();this.select(targets[event.key],false);this.sceneButtons[this.model.index].focus();}
      });
      this.listen(this.doc,'visibilitychange',()=>this.applyMotion());
      this.listen(this.media,'change',()=>this.applyMotion());
      this.select(0,false);
    }
    element(tag,className='',content){const el=this.doc.createElement(tag);if(className)el.className=className;if(content!==undefined)el.textContent=content;return el;}
    button(label,action){const el=this.element('button','',label);el.type='button';this.listen(el,'click',action);return el;}
    listen(target,event,action){target.addEventListener(event,action);this.listeners.push([target,event,action]);}
    select(index,focus=false){
      requireValue(!this.destroyed,'The reader has been destroyed.');
      this.model.select(index);if(this.visual)this.visual.destroy();this.visual=null;
      const scene=this.model.current;this.figure.replaceChildren();this.figure.setAttribute('role','img');this.figure.setAttribute('aria-label',scene.visual.alt);this.heading.textContent=scene.title;
      this.paragraphs.replaceChildren(...this.model.currentBlocks.map(block=>{const el=this.element(block.kind==='heading'?'h3':'p','',block.text);el.dataset.sourceBlock=block.id;return el;}));
      if(scene.visual.kind==='image'){
        const image=this.element('img');image.src=scene.visual.src;image.alt=scene.visual.alt;image.decoding='async';this.figure.removeAttribute('role');this.figure.removeAttribute('aria-label');this.figure.append(image);
        this.visual={pause(){},resume(){},destroy:()=>image.remove()};
      }else{
        const controller=this.renderers[scene.visual.rendererId](this.figure,{scene,book:this.model.book,reducedMotion:this.media.matches,paused:this.paused,audioEnabled:false});
        requireValue(controller&&['pause','resume','destroy'].every(key=>typeof controller[key]==='function'),'A visual renderer must provide pause, resume and destroy lifecycle methods.');this.visual=controller;
      }
      this.sceneButtons.forEach((button,i)=>button.setAttribute('aria-current',i===index?'step':'false'));
      this.previous.disabled=index===0;this.next.disabled=index===this.model.count-1;
      this.status.textContent='Scene '+(index+1)+' of '+this.model.count+'.';this.applyMotion();if(focus)this.heading.focus();
    }
    applyMotion(){
      if(this.destroyed||!this.visual)return;
      const stopped=this.paused||this.media.matches||this.doc.hidden;this.root.dataset.motion=stopped?'still':'running';
      this.motion.disabled=this.media.matches;this.motion.textContent=this.media.matches?'Reduced motion enabled':this.paused?'Enable motion':'Pause motion';
      if(stopped)this.visual.pause();else this.visual.resume();
    }
    destroy(){if(this.destroyed)return;if(this.visual)this.visual.destroy();this.listeners.forEach(([target,event,action])=>target.removeEventListener(event,action));this.listeners=[];this.root.replaceChildren();this.destroyed=true;}
  }
  return {validateBook,ReaderModel,IllustratedReader};
});
