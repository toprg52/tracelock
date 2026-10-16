from fastapi import APIRouter
from backend.app.services.graph_service import CampaignGraph

router = APIRouter()

@router.get("/{case_id}")
def get_campaign_graph(case_id: str):
    try:
        graph = CampaignGraph()
        related = graph.find_related_campaigns(str(case_id))
        graph.close()
        
        # Transform the result into node/edge format expected by the frontend
        nodes = [{"id": str(case_id), "label": "APK", "properties": {"is_source": True}}]
        edges = []
        
        added_nodes = set([str(case_id)])
        
        for record in related:
            related_case = record.get("related_case", "unknown_case")
            link_type_list = record.get("link_type", [])
            shared_node = record.get("shared", {})
            
            link_type = link_type_list[0] if isinstance(link_type_list, list) and link_type_list else "Shared"
            shared_id = f"{link_type}-{related_case}"
            
            if shared_id not in added_nodes:
                nodes.append({"id": shared_id, "label": link_type, "properties": dict(shared_node) if isinstance(shared_node, dict) else {"val": str(shared_node)}})
                added_nodes.add(shared_id)
                edges.append({"source": str(case_id), "target": shared_id, "type": "SHARES"})
                
            if related_case not in added_nodes:
                nodes.append({"id": related_case, "label": "APK", "properties": {"is_source": False}})
                added_nodes.add(related_case)
                
            edges.append({"source": related_case, "target": shared_id, "type": "SHARES"})
            
        return {
            "nodes": nodes,
            "edges": edges
        }
    except Exception as e:
        print(f"[!] Campaign graph error: {e}")
        return {
            "nodes": [{"id": str(case_id), "label": "APK", "properties": {"error": str(e)}}],
            "edges": []
        }

