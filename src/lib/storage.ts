import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import {
	MINIO_ENDPOINT,
	MINIO_ACCESS_KEY,
	MINIO_SECRET_KEY,
	MINIO_BUCKET
} from '$env/static/private';

const client = new S3Client({
	endpoint: MINIO_ENDPOINT,
	region: 'us-east-1',
	credentials: {
		accessKeyId: MINIO_ACCESS_KEY,
		secretAccessKey: MINIO_SECRET_KEY
	},
	forcePathStyle: true
});

export async function uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
	await client.send(
		new PutObjectCommand({
			Bucket: MINIO_BUCKET,
			Key: key,
			Body: body,
			ContentType: contentType
		})
	);
	return key;
}

export async function deleteFile(key: string): Promise<void> {
	await client.send(new DeleteObjectCommand({ Bucket: MINIO_BUCKET, Key: key }));
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
	return getSignedUrl(client, new GetObjectCommand({ Bucket: MINIO_BUCKET, Key: key }), {
		expiresIn
	});
}
