
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np

# Simple inference wrapper using a TF-Hub SSD detector.
# Default model: SSD MobileNet V2 (COCO). You can swap to another TF-Hub detector.

DEFAULT_HUB_MODEL = "https://tfhub.dev/tensorflow/ssd_mobilenet_v2/2"

class TFHubDetector:
    def __init__(self, model_url: str = DEFAULT_HUB_MODEL):
        self.detector = hub.load(model_url)

    @tf.function
    def _infer_one(self, image):
        # image: [H, W, 3] float32 in [0,1]
        return self.detector(tf.expand_dims(image, axis=0))

    def predict(self, image):
        outputs = self._infer_one(image)
        # outputs keys vary by model; for ssd_mobilenet_v2/2:
        # 'detection_boxes' [1,100,4] (ymin,xmin,ymax,xmax), 'detection_scores', 'detection_classes'
        boxes = outputs['detection_boxes'][0].numpy()        # [N,4] in [0,1]
        scores = outputs['detection_scores'][0].numpy()      # [N]
        classes = outputs['detection_classes'][0].numpy().astype(np.int32)  # [N], 1-indexed for COCO
        return boxes, scores, classes
