import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	CreateBucketCommand,
	HeadBucketCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

export async function ensureBucket(): Promise<void> {
	try {
		await client.send(new HeadBucketCommand({ Bucket: MINIO_BUCKET }));
	} catch {
		await client.send(new CreateBucketCommand({ Bucket: MINIO_BUCKET }));
	}
}

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

export async function getFileContent(key: string): Promise<{ body: Uint8Array; contentType: string }> {
	const result = await client.send(new GetObjectCommand({ Bucket: MINIO_BUCKET, Key: key }));
	const body = await result.Body!.transformToByteArray();
	return { body, contentType: result.ContentType ?? 'application/octet-stream' };
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
	return getSignedUrl(client, new GetObjectCommand({ Bucket: MINIO_BUCKET, Key: key }), {
		expiresIn
	});
}
