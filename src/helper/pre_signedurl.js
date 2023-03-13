const getSingedUrl = (s3_client, bucket_name, file_key, expiry) => {
  const params = {
    Bucket: bucket_name,
    Key: file_key,
    Expires: expiry
  };
  url = s3_client.getSignedUrl('getObject', params);
  return url
}

module.exports = getSingedUrl;