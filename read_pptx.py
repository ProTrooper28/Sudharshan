import zipfile
import xml.etree.ElementTree as ET
import os

pptx_path = r'C:\Users\Tanya\Downloads\SIH2026-IDEA-Presentation-Format.pptx'
if os.path.exists(pptx_path):
    with zipfile.ZipFile(pptx_path, 'r') as z:
        for name in z.namelist():
            if name.startswith('ppt/slides/slide') and name.endswith('.xml'):
                content = z.read(name)
                root = ET.fromstring(content)
                text = ' '.join(root.itertext())
                print(f"--- {name} ---")
                print(text.strip()[:500])

