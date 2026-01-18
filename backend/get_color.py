from PIL import Image

def get_bg_color(image_path):
    try:
        img = Image.open(image_path)
        width, height = img.size
        points = [
            (0, height - 1),
            (width // 4, height - 1),
            (width // 2, height - 1),
            (3 * width // 4, height - 1),
            (width - 1, height - 1)
        ]
        colors = []
        for p in points:
            pixel = img.getpixel(p)
            colors.append(pixel)
        return img.size
    except Exception as e:
        return str(e)

print("EV Header:", get_bg_color(r"d:\PYTHON PROJECTS\AI UNIPOD\Horizn\mobile\assets\email_verify_header.png"))
print("EV Footer:", get_bg_color(r"d:\PYTHON PROJECTS\AI UNIPOD\Horizn\mobile\assets\email_verify_footer.png"))
