content = open('scripts/train_models.py', encoding='utf-8').read()
old = 'datetime.utcnow().isoformat() + "Z"'
new = 'datetime.now(timezone.utc).isoformat()'
content = content.replace(old, new)
open('scripts/train_models.py', 'w', encoding='utf-8').write(content)
print('fixed:', old, '->', new)
