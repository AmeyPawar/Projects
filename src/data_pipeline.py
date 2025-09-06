
import tensorflow as tf
import tensorflow_datasets as tfds

# This module builds tf.data pipelines from the provided TFDS builder.
# It expects the dataset to be registered locally (using the provided builder code).
# For quick tests, you can use a smaller split with take().

AUTOTUNE = tf.data.AUTOTUNE

def load_split(builder_name: str, split: str, batch_size: int = 2, image_size=(640, 640)):
    ds, info = tfds.load(builder_name, split=split, with_info=True, shuffle_files=False)
    num_classes = info.features['bobjects']['label'].num_classes

    def _preprocess(example):
        image = tf.image.convert_image_dtype(example['image'], tf.float32)
        image = tf.image.resize(image, image_size)
        # Pack targets in a simple dict for detection models.
        # Boxes come as tfds.features.BBox (ymin, xmin, ymax, xmax) normalized in [0,1]
        # We'll convert to ymin, xmin, ymax, xmax tensors and classes int32.
        bboxes = example['bobjects']['bbox']
        ymin = bboxes['ymin'][..., tf.newaxis]
        xmin = bboxes['xmin'][..., tf.newaxis]
        ymax = bboxes['ymax'][..., tf.newaxis]
        xmax = bboxes['xmax'][..., tf.newaxis]
        boxes = tf.concat([ymin, xmin, ymax, xmax], axis=-1)
        classes = tf.cast(example['bobjects']['label'], tf.int32)
        return image, {'boxes': boxes, 'classes': classes}

    ds = ds.map(_preprocess, num_parallel_calls=AUTOTUNE)
    ds = ds.padded_batch(batch_size, padding_values=(0.0, {'boxes': 0.0, 'classes': -1}))
    ds = ds.prefetch(AUTOTUNE)
    return ds, num_classes, info
