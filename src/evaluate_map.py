
# Minimal mAP@0.5 evaluator for demonstration.
# This is not a full COCO/OpenImages evaluator, but a simple IoU>=0.5 AP calculation.

import numpy as np

def iou(box_a, box_b):
    # boxes are [ymin,xmin,ymax,xmax] in [0,1]
    ya1, xa1, ya2, xa2 = box_a
    yb1, xb1, yb2, xb2 = box_b
    inter_y1, inter_x1 = max(ya1, yb1), max(xa1, xb1)
    inter_y2, inter_x2 = min(ya2, yb2), min(xa2, xb2)
    inter = max(0.0, inter_y2 - inter_y1) * max(0.0, inter_x2 - inter_x1)
    area_a = max(0.0, ya2 - ya1) * max(0.0, xa2 - xa1)
    area_b = max(0.0, yb2 - yb1) * max(0.0, xb2 - xb1)
    union = area_a + area_b - inter + 1e-8
    return inter / union

def average_precision(gt_boxes, pred_boxes, pred_scores, iou_thresh=0.5):
    # gt_boxes: list of boxes for a single image
    # pred_boxes: list of predicted boxes for a single image
    # pred_scores: list of scores aligned with pred_boxes
    if len(gt_boxes) == 0:
        return 0.0 if len(pred_boxes) > 0 else 1.0
    order = np.argsort(pred_scores)[::-1]
    pred_boxes = [pred_boxes[i] for i in order]
    pred_scores = [pred_scores[i] for i in order]

    matched = [False]*len(gt_boxes)
    tp, fp = [], []
    for pb in pred_boxes:
        best_iou = 0.0
        best_j = -1
        for j, gb in enumerate(gt_boxes):
            if matched[j]:
                continue
            i = iou(pb, gb)
            if i > best_iou:
                best_iou = i
                best_j = j
        if best_iou >= iou_thresh:
            matched[best_j] = True
            tp.append(1); fp.append(0)
        else:
            tp.append(0); fp.append(1)
    tp = np.array(tp); fp = np.array(fp)
    cum_tp = np.cumsum(tp); cum_fp = np.cumsum(fp)
    precisions = cum_tp / (cum_tp + cum_fp + 1e-8)
    recalls = cum_tp / (len(gt_boxes) + 1e-8)

    # 11-point interpolation (PASCAL VOC 2007 style) for simplicity
    ap = 0.0
    for t in np.linspace(0,1,11):
        p = np.max(precisions[recalls>=t]) if np.any(recalls>=t) else 0.0
        ap += p
    return ap/11.0

def map_at_05(list_of_gt_boxes, list_of_pred_boxes, list_of_pred_scores):
    aps = []
    for gt, pb, ps in zip(list_of_gt_boxes, list_of_pred_boxes, list_of_pred_scores):
        aps.append(average_precision(gt, pb, ps, iou_thresh=0.5))
    return float(np.mean(aps)) if len(aps)>0 else 0.0
