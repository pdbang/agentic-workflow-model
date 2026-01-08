import { NextRequest, NextResponse } from 'next/server'
import { listAgentVersions, getAgentPath, pathExists } from '@/lib/utils/paths'
import { getAgentMetadata } from '@/lib/agents/parser'
import { writeYamlFile } from '@/lib/yaml/writer'
import path from 'path'
import fs from 'fs/promises'

interface RouteParams {
  params: Promise<{
    agentId: string
  }>
}

/**
 * GET /api/agents/:agentId/versions
 * Liste toutes les versions d'un agent
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') || 'test_client'

    const versions = await listAgentVersions(clientId, agentId)

    const versionDetails = await Promise.all(
      versions.map(async (version) => {
        const metadata = await getAgentMetadata(clientId, agentId, version)
        return {
          version,
          ...metadata,
        }
      }),
    )

    return NextResponse.json({
      agentId,
      clientId,
      versions: versionDetails,
    })
  }
  catch (error) {
    console.error('Error in GET /api/agents/:agentId/versions:', error)
    return NextResponse.json(
      { error: 'Failed to load agent versions' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/agents/:agentId/versions
 * Crée une nouvelle version d'un agent
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { agentId } = await params
    const body = await request.json()
    const { clientId = 'test_client', sourceVersion = 'latest', newVersion } = body

    if (!newVersion) {
      return NextResponse.json(
        { error: 'newVersion is required' },
        { status: 400 },
      )
    }

    const sourcePath = getAgentPath(clientId, agentId, sourceVersion)
    const targetPath = getAgentPath(clientId, agentId, newVersion)

    // Vérifier que la source existe
    if (!(await pathExists(sourcePath))) {
      return NextResponse.json(
        { error: 'Source version not found' },
        { status: 404 },
      )
    }

    // Vérifier que la cible n'existe pas déjà
    if (await pathExists(targetPath)) {
      return NextResponse.json(
        { error: 'Version already exists' },
        { status: 409 },
      )
    }

    // Copier récursivement la version source vers la nouvelle version
    await fs.cp(sourcePath, targetPath, { recursive: true })

    return NextResponse.json({
      success: true,
      message: 'Version created successfully',
      agentId,
      clientId,
      sourceVersion,
      newVersion,
    }, { status: 201 })
  }
  catch (error) {
    console.error('Error in POST /api/agents/:agentId/versions:', error)
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 },
    )
  }
}
