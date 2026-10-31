"""Scoped GitHub Pages administration using GCM credentials in memory only.

The connected GitHub tool has no Pages configuration capability. Never prints
or writes credentials. Requires existing git credential-manager authorization.
"""
import base64
import json
from pathlib import Path
import subprocess
import sys
import urllib.error
import urllib.request

REPOSITORY='wizz13150/prime-gap-network.github.io'
ROOT=Path(__file__).resolve().parents[1]
assert subprocess.check_output(['git','remote','get-url','origin'],cwd=ROOT,text=True).strip().removesuffix('.git').rstrip('/')=='https://github.com/'+REPOSITORY

def credential():
    result=subprocess.run(['git','credential','fill'],input='protocol=https\nhost=github.com\n\n',text=True,capture_output=True,cwd=ROOT,timeout=30)
    if result.returncode:
        raise RuntimeError('Git Credential Manager did not supply authorization; credential details suppressed.')
    values=dict(line.split('=',1) for line in result.stdout.splitlines() if '=' in line)
    if not values.get('password'):
        raise RuntimeError('No GitHub credential available.')
    return values['password']

TOKEN=credential()
def api(endpoint='',method='GET',payload=None):
    body=json.dumps(payload).encode() if payload is not None else None
    request=urllib.request.Request('https://api.github.com/repos/'+REPOSITORY+endpoint,data=body,method=method,headers={'Authorization':'Bearer '+TOKEN,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'PGN-website-publication','Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(request,timeout=30) as response:
            raw=response.read(100_000)
            return response.status,json.loads(raw) if raw else {}
    except urllib.error.HTTPError as error:
        content=json.loads(error.read(8000))
        return error.code,{'message':content.get('message'),'errors':content.get('errors')}

mode=sys.argv[1] if len(sys.argv)>1 else 'inspect'
if mode=='enable':
    status,current=api('/pages')
    if status==404:
        status,current=api('/pages','POST',{'build_type':'legacy','source':{'branch':'main','path':'/'}})
    elif status==200 and (current.get('source')!={'branch':'main','path':'/'} or current.get('build_type')!='legacy'):
        status,current=api('/pages','PUT',{'build_type':'legacy','source':{'branch':'main','path':'/'}})
    print(json.dumps({'http':status,**{k:current.get(k) for k in ['html_url','status','build_type','source','message','errors']}},indent=2))
    if status not in [200,201,204]:sys.exit(1)
elif mode=='build':
    status,result=api('/pages/builds','POST',{})
    print(json.dumps({'http':status,**{k:result.get(k) for k in ['status','url','message']}},indent=2))
elif mode=='inspect':
    for endpoint in ['/pages','/pages/builds/latest']:
        status,result=api(endpoint)
        print(json.dumps({'endpoint':endpoint,'http':status,**{k:result.get(k) for k in ['html_url','status','build_type','source','commit','error','message']}},indent=2))
else:
    raise SystemExit('Use inspect, enable, or build.')
