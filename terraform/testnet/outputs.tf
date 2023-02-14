output "cloudfront" {
  value = "${aws_cloudfront_distribution.wallet-ui_distribution.id}"
}

output "s3" {
  value = "${aws_s3_bucket.wallet-ui.bucket}"
}
