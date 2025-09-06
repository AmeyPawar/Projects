
import argparse, os, numpy as np
import tensorflow as tf
from data_pipeline import load_split
from infer_tfhub import TFHubDetector
from visualize import draw_boxes
from evaluate_map import map_at_05
import matplotlib.pyplot as plt

def cmd_visualize(args):
    ds, _, _ = load_split(args.builder, args.split, batch_size=1, image_size=(args.size, args.size))
    detector = TFHubDetector(args.model)
    os.makedirs(args.outdir, exist_ok=True)
    for i, (image, target) in enumerate(ds.take(args.num)):
        img = image[0].numpy()
        boxes, scores, classes = detector.predict(img)
        fig, ax = plt.subplots(figsize=(6,6))
        draw_boxes((img*255).astype('uint8'), boxes, scores, classes, score_thresh=args.score_thresh, ax=ax)
        fig.savefig(os.path.join(args.outdir, f"viz_{i:04d}.png"))
        plt.close(fig)

def cmd_evaluate(args):
    ds, _, _ = load_split(args.builder, args.split, batch_size=1, image_size=(args.size, args.size))
    detector = TFHubDetector(args.model)
    gt_boxes_all, pred_boxes_all, pred_scores_all = [], [], []
    for i, (image, target) in enumerate(ds.take(args.num)):
        img = image[0].numpy()
        gt_boxes = target['boxes'][0].numpy().tolist()
        gt_boxes = [b for b in gt_boxes if b[2]>b[0] and b[3]>b[1]]  # valid boxes
        boxes, scores, classes = detector.predict(img)
        # keep top K
        K = args.topk
        pred_boxes_all.append(boxes[:K].tolist())
        pred_scores_all.append(scores[:K].tolist())
        gt_boxes_all.append(gt_boxes)
    m = map_at_05(gt_boxes_all, pred_boxes_all, pred_scores_all)
    print(f"mAP@0.5 over {len(gt_boxes_all)} images: {m:.4f}")

def main():
    p = argparse.ArgumentParser(description="Minimal OpenImages Detection demo")
    p.add_argument("--builder", type=str, default="open_images_challenge2019/200k",
                   help="TFDS builder name (e.g., 'open_images_challenge2019/200k')")
    p.add_argument("--split", type=str, default="validation[:50]",
                   help="TFDS split string (e.g., 'validation[:50]')")
    p.add_argument("--size", type=int, default=640)
    p.add_argument("--model", type=str, default="https://tfhub.dev/tensorflow/ssd_mobilenet_v2/2")
    sub = p.add_subparsers(dest="cmd")

    vis = sub.add_parser("visualize")
    vis.add_argument("--outdir", type=str, default="outputs")
    vis.add_argument("--num", type=int, default=5)
    vis.add_argument("--score-thresh", type=float, default=0.3, dest="score_thresh")
    vis.set_defaults(func=cmd_visualize)

    ev = sub.add_parser("evaluate")
    ev.add_argument("--num", type=int, default=50)
    ev.add_argument("--topk", type=int, default=50)
    ev.set_defaults(func=cmd_evaluate)

    args = p.parse_args()
    if not args.cmd:
        p.print_help()
        return
    args.func(args)

if __name__ == "__main__":
    main()
