import os
import re
import urllib.request
import hashlib

os.makedirs('assets/images', exist_ok=True)

html_files = [f for f in os.listdir('designs') if f.endswith('.html')]
image_urls = set()

for html_file in html_files:
    with open(os.path.join('designs', html_file), 'r', encoding='utf-8') as f:
        content = f.read()
        urls = re.findall(r'src="(https://lh3\.googleusercontent\.com/[^"]+)"', content)
        for url in urls:
            image_urls.add(url)

for i, url in enumerate(image_urls):
    filename = f"image_{hashlib.md5(url.encode()).hexdigest()[:8]}.jpg"
    print(f"Downloading {url} to {filename}")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            with open(os.path.join('assets/images', filename), 'wb') as out_file:
                out_file.write(response.read())
        
        # Replace the URL in the HTML files with the local path
        for html_file in html_files:
            file_path = os.path.join('designs', html_file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            content = content.replace(url, f"../assets/images/{filename}")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
    except Exception as e:
        print(f"Failed to download {url}: {e}")

print("Done downloading images.")
