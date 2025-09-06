
# OpenImages Detection – Minimal Complete Project

This is a small, **end-to-end demo** wrapped around your TFDS dataset builder for **Open Images Challenge 2019 (Detection Track)**. It focuses on:
- Using your dataset builder to load images + bounding boxes with `tf.data`
- Running **inference** with a TF‑Hub SSD detector
- Visualizing predictions
- Computing a toy **mAP@0.5** metric (simple evaluator for demo purposes)

> ⚠️ Note: This is a lightweight demo (inference + evaluation). Full training from scratch for Open Images is large/expensive and out-of-scope here, but you can plug in your own Keras/TF models using `data_pipeline.py`.

## Layout
```
src/
  dataset_builder/           # your builder + dataset README + metadata
  data_pipeline.py           # tf.data pipeline from TFDS examples
  infer_tfhub.py             # TF-Hub SSD MobileNet V2 inference wrapper
  visualize.py               # drawing boxes utility
  evaluate_map.py            # simple mAP@0.5 (IoU>=0.5) evaluator
  main.py                    # CLI: visualize & evaluate
README.md
requirements.txt
config.yaml
```

## Quickstart

1) **Install dependencies**
```bash
pip install -r requirements.txt
```

2) **Make sure your TFDS builder is discoverable**  
Point `TFDS_DATA_DIR` to a writable location and ensure the module path includes `src/dataset_builder` if you'd like to register the builder as a local dataset. One simple way is to run from the `src` folder so Python can import local modules.

3) **Build / load the dataset**  
The builder loads images & annotations as defined in your `open_images_challenge2019.py`. It will download the splits on first use.

4) **Visualize predictions (inference only)**
```bash
python -m src.main --builder open_images_challenge2019/200k --split "validation[:10]" visualize --outdir outputs --num 5
```

5) **Evaluate a small subset**  
This runs a simple mAP@0.5 across a subset using TF‑Hub model predictions.
```bash
python -m src.main --builder open_images_challenge2019/200k --split "validation[:50]" evaluate --num 50
```

## Notes
- Default inference model: `https://tfhub.dev/tensorflow/ssd_mobilenet_v2/2` (COCO). You can swap to any object detection TF‑Hub model that returns `detection_boxes`, `detection_scores`, `detection_classes`.
- `evaluate_map.py` is intentionally simple; for research-grade metrics, integrate COCO or Open Images evaluation tooling.
- If you wish to train, use `data_pipeline.py` to feed images/targets into your Keras model.
