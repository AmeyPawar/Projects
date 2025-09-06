
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

def denorm_box(box, h, w):
    ymin, xmin, ymax, xmax = box
    return xmin*w, ymin*h, (xmax - xmin)*w, (ymax - ymin)*h  # x, y, width, height

def draw_boxes(image, boxes, scores=None, classes=None, score_thresh=0.3, ax=None):
    if ax is None:
        fig, ax = plt.subplots(figsize=(6,6))
    ax.imshow(image)
    ax.axis('off')
    H, W = image.shape[0], image.shape[1]
    for i, box in enumerate(boxes):
        sc = scores[i] if scores is not None else None
        if sc is not None and sc < score_thresh:
            continue
        x, y, w, h = denorm_box(box, H, W)
        rect = patches.Rectangle((x,y), w, h, fill=False, linewidth=2)
        ax.add_patch(rect)
        label = f"{classes[i]}" if classes is not None else "obj"
        txt = f"{label}" + (f" {sc:.2f}" if sc is not None else "")
        ax.text(x, y, txt, fontsize=8, bbox=dict(facecolor='white', alpha=0.6, edgecolor='none'))
    return ax
